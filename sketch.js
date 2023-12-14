let mic, recorder, soundFile, soundMode;
let isRecording, isPlaying, isLoading;
let recordButton, playButton, duplicateButton;
let currentPlayTime = 0;
let duplications;
let soundQueue = [];

let state = 0;
let song;

const serviceUuid = "e5cfc525-435a-4458-8940-3e4f267d468f";
let myCharacteristic, myCharacteristic2;
let myValue = "-1";
let myBLE;

let gyroX, lightLevel;
let lastGyroX = - 1;
let lastLightLevel = 500;
let message, lastMessage;

let connected = false;

function preload() {

  song = loadSound('Around_the_world.mp3')
  // soundQueue.push(song);

}

function setup() {

  createCanvas(400, 400);
  background(200);
  fill(0);
  textSize(50);
  textAlign(CENTER);

  myBLE = new p5ble();

  isRecording = isPlaying = isRecording = false;

  // Create a 'Connect' button
  const connectButton = createButton("Connect");
  connectButton.mousePressed(connectToBle);

  // create record button
  recordButton = createButton('record');
  recordButton.position(0, 0);
  recordButton.value = false;
  recordButton.mousePressed(() => {

    if (recordButton.value === false) {

      startRecording();
      // record(soundFile, [duration], [callback])
      recordButton.value = true;
      recordButton.elt.innerText = 'stop';

    } else {

      stopRecording();
      recordButton.value = false;
      recordButton.elt.innerText = 'record';

    }
  })

  // create play button
  playButton = createButton('play');
  playButton.position(0, 30);
  playButton.mousePressed(() => {

    if (soundFile.buffer) soundFile.play();

  });

  // create play duplicate button
  playButton = createButton('play duplicate');
  playButton.position(0, 60);
  playButton.mousePressed(() => {

    soundMode = 1;
    duplications.startTime = millis();

  });

  // create pause duplicate button
  playButton = createButton('pause duplicate');
  playButton.position(0, 90);
  playButton.mousePressed(() => {

    soundMode = 0;
    duplications.pause();

  });



  // create an audio in
  mic = new p5.AudioIn();
  mic.start();

  recorder = new p5.SoundRecorder();
  recorder.setInput(mic);

  soundFile = new p5.SoundFile();
  soundFile.playMode('sustain');

}

function draw() {

  background(200);

  let valueArray = split(myValue.toString(), ',');
  if (valueArray[0]) gyroX = valueArray[0];
  let threshold = 0.6;
  // if (soundQueue.length > 0) threshold = map(soundQueue[0].currentTime(), 0, soundQueue[0].duration(), 0.3, -1);

  if (gyroX < threshold) {

    if (isRecording === true) {
      stopRecording();
    }

    if (isPlaying === false) {

      if (soundQueue.length > 0 && soundQueue[0].buffer) {
        soundQueue[0].play();
        isPlaying = true;
      }
    }
  } else {

    if (isRecording === false && soundQueue.length === 0) {
      startRecording();
    }

    if (isPlaying === true) {
      soundQueue[0].pause();
      isPlaying = false;
    }
  }

  if (isPlaying) {

    let volume = map(gyroX, threshold, -1, 0, 100);
    let volumeFactor = 1;
    let speed = map(gyroX, threshold, -1, 0.2, 2.0);
    speed = constrain(speed, 0.2, 2.0);

    for (let s = soundQueue.length - 1; s >= 0; s--) {

      if (soundQueue[s].currentTime() / soundQueue[s].duration() > 0.4) {
        volumeFactor = map(soundQueue[s].currentTime() / soundQueue[s].duration(), 0.4, 1, 1, 0);
      }
      soundQueue[s].setVolume(volume * volumeFactor);
      soundQueue[s].rate(speed);

      // console.log(soundQueue[s].duration() - soundQueue[s].currentTime());
      // if (soundQueue[s].duration() - soundQueue[s].currentTime() < 0.1) soundQueue.splice(s, 1);
      soundQueue[s].onended(() => {
        soundQueue.splice(s, 1);
      })
    }

    if (soundQueue.length === 0) isPlaying = false;
  }


  if (isPlaying === true) {
    message = "red";
  } else if (isRecording === true) {
    message = "green";
  } else {
    message = "red";
  }

  if (connected && message != lastMessage) writeToBle(message);

  lastMessage = message;

  let message3 = message + ',' + soundQueue.length;
  text(gyroX, 150, 200);
  text(message3, 150, 300);

}

class Duplication {

  constructor(s1, s2, s3) {

    this.soundList = [s1, s2, s3];
    this.isPlayed = [false, false, false];
    this.cue = [0, 500, 1000];
    this.startCue = 0;
    this.startTime;
    this.individualTime = [0, 0, 0];

  }

  play() {

    for (let i = 0; i < 3; i++) {

      if (this.isPlayed[i] == false &&
        millis() - this.startTime >= this.cue[i]) {

        this.soundList[i].play(0, 1, 0, this.startCue);
        this.isPlayed[i] = true;
        this.individualTime[i] = millis();

      }

      if (this.soundList[i].isPlaying()) {

        smoothIn(this.soundList[i], this.individualTime[i], 1000);

      }
    }

  }

  pause() {

    this.startCue = this.soundList[2].currentTime();

    for (let i = 0; i < 3; i++) {

      this.soundList[i].stop();
      this.isPlayed[i] = false;

    }

  }

}

function connectToBle() {
  // Connect to a device by passing the service UUID
  myBLE.connect(serviceUuid, gotCharacteristics);
}

function gotCharacteristics(error, characteristics) {
  connected = true;
  if (error) console.log("error: ", error);
  console.log("characteristics: ", characteristics);
  console.log(characteristics[1].properties.notify);
  // Set the first characteristic as myCharacteristic
  if (characteristics[0].properties.notify == true) {
    myCharacteristic = characteristics[0];
    myCharacteristic2 = characteristics[1];
  } else {
    myCharacteristic = characteristics[1];
    myCharacteristic2 = characteristics[0];
  }

  // read the value of the first characteristic
  myBLE.read(myCharacteristic, gotValue);
}

function gotValue(error, value) {

  if (error) console.log("error: ", error);
  // console.log("value: ", value);
  myValue = value;
  myBLE.read(myCharacteristic, 'string', gotValue);
}

function writeToBle(message) {
  const inputValue = message;
  // Write the value of the input to the myCharacteristic
  myBLE.write(myCharacteristic2, inputValue);
}

function startRecording() {

  isRecording = true;
  recorder.record(soundFile, 10,
    () => {

      soundQueue.push(soundFile);
      isRecording = false;
      // duplications = new Duplication(
      //   new p5.SoundFile(soundFile.getBlob()),
      //   new p5.SoundFile(soundFile.getBlob()),
      //   new p5.SoundFile(soundFile.getBlob()));

    });
}

function stopRecording() {

  recorder.stop();
}

function playOriginal() {

  soundFile.amp(100);
  if (soundFile.buffer) soundFile.play();
}

function pauseOrginal() {

  soundFile.pause();
}

function playDuplicate() {

  soundMode = 1;
  duplications.startTime = millis();

}

function pauseDuplicate() {

  soundMode = 0;
  duplications.pause();

}
