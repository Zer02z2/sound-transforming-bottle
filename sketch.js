let mic, recorder, soundFile, soundMode;
let isRecording, isPlaying, isClosed, isEmpty;
let recordButton, playButton, duplicateButton;
let currentPlayTime = 0;
let duplications;
let soundQueue = [ , , ,];

let state = 0;
let song;

const serviceUuid = "e5cfc525-435a-4458-8940-3e4f267d468f";
let myCharacteristic;
let myValue = "-1, 20";
let myBLE;

let gyroX, distance;
let lastGyroX = - 1;
let lastDistance = 20;

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

  isRecording = isPlaying = isClosed = false;
  isEmpty = true;

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
  if (valueArray[1]) distance = valueArray[1];
  let threshold = 0;
  // if (!isEmpty) threshold = map(soundQueue[0].currentTime(), 0, soundQueue[0].duration(), 0.3, -1);

  if (distance < 20 && lastDistance < 20) isClosed = true;
  else if (distance >= 20 && lastDistance >= 20) isClosed = false;

  if (gyroX < threshold) {

    if (isRecording === true) {
      stopRecording();
    }

    if (isPlaying === false) {

      if (!isEmpty && soundQueue[0].buffer) {
        soundQueue[0].play();
        isPlaying = true;
      }
    }
  } else {

    if (isRecording === false && isEmpty) {
      startRecording();
    }

    if (isPlaying === true) {
      soundQueue[0].pause();
      isPlaying = false;
    }
  }

  if (isPlaying) {

    let volume = map(gyroX, threshold, -1, 0, 50);
    let speed = map(gyroX, threshold, -1, 0.2, 5);
    speed = constrain(speed, 0.2, 5);

    for (let s = soundQueue.length - 1; s >= 0; s--) {

      soundQueue[s].setVolume(10);
      soundQueue[s].rate(1);

      console.log(soundQueue[s].duration() - soundQueue[s].currentTime());
      if (soundQueue[s].duration() - soundQueue[s].currentTime() < 0.1) isEmpty = true;
    }

    if (isEmpty) isPlaying = false;
  }


  let message;
  if (isPlaying === true) message = "isPlaying";
  else if (isRecording === true) message = "isRecording";
  else message = "waiting";
  message += ',' + soundQueue.length;
  text(gyroX, 150, 100);
  text(distance, 150, 200);
  text(message, 150, 300);

}

function smoothIn(s, startTime, interval) {

  let amp;
  let duration = floor(millis() - startTime);
  if (duration <= interval) {

    amp = map(duration, 0, interval, 0, 1);

  } else {

    amp = 1;

  }

  s.amp(amp);

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
  if (error) console.log("error: ", error);
  // console.log("characteristics: ", characteristics);
  // Set the first characteristic as myCharacteristic
  myCharacteristic = characteristics[0];
  // console.log(myCharacteristic);

  // read the value of the first characteristic
  myBLE.read(myCharacteristic, gotValue);
}

function gotValue(error, value) {

  if (error) console.log("error: ", error);
  // console.log("value: ", value);
  myValue = value;
  myBLE.read(myCharacteristic, 'string', gotValue);
}

function startRecording() {

  isRecording = true;
  recorder.record(soundFile, 5,
    () => {

      soundQueue[0] = soundFile;
      isRecording = false;
      isEmpty = false;
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

function playSounds() {

  if (soundMode === 0) {


  }
}
