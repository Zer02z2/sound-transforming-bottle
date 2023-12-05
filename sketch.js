let mic, recorder, soundFile, soundMode;
let recordButton, playButton, duplicateButton;
let duplications;
//let modifiedSounds = [];

let state = 0;

const serviceUuid = "19B10010-E8F2-537E-4F6C-D104768A1214";
let myCharacteristic;
let myValue = "1,0,0,500";
let input;
let myBLE;

let gyroX, lightLevel;
let lastGyroX = 1;
let lastLightLevel = 500;

function setup() {

  createCanvas(400, 400);
  background(200);
  fill(0);
  textSize(50);
  textAlign(CENTER);

  myBLE = new p5ble();

  // Create a 'Connect' button
  const connectButton = createButton("Connect");
  connectButton.mousePressed(connectToBle);

  // Create a text input
  input = createInput();

  // Create a 'Write' button
  const writeButton = createButton("Write");
  writeButton.mousePressed(writeToBle);

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
  fill(0);
  textSize(30);

  let valueArray = split(myValue.toString(), ',');
  if (valueArray[0]) gyroX = valueArray[0];
  if (valueArray[3]) lightLevel = valueArray[3];


  text(gyroX, 150, 200);
  text(lightLevel, 250, 200);

  if (lightLevel > 300) {

    if (gyroX >= 0) {

      if (lastLightLevel <= 300 || lastGyroX < 0) startRecording();

    } else if (gyroX < 0) {

      if (lastGyroX >= 0) {
        
        stopRecording();
        playOriginal();

      }
    }
    
  } else if (lightLevel <= 300) {

    if (lastLightLevel > 300) stopRecording();

    if (gyroX <= 0) {

      if (lastGyroX > 0) {

        playDuplicate();
      }
    } else if (gyroX > 0) {

      if (lastGyroX <= 0) pauseDuplicate();
    }
  }

  lastGyroX = gyroX;
  lastLightLevel = lightLevel;

  if (soundMode == 1) {

    duplications.play();

  }


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
  console.log("characteristics: ", characteristics);
  // Set the first characteristic as myCharacteristic
  myCharacteristic = characteristics[0];
  console.log(myCharacteristic);

  // read the value of the first characteristic
  myBLE.read(myCharacteristic, gotValue);
}

function gotValue(error, value) {

  if (error) console.log("error: ", error);
  console.log("value: ", value);
  myValue = value;
  myBLE.read(myCharacteristic, 'string', gotValue);
}

function writeToBle() {
  const inputValue = input.value();
  // Write the value of the input to the myCharacteristic
  myBLE.write(myCharacteristic, inputValue);
}

function startRecording() {

  soundMode = 0;
  recorder.record(soundFile, 10,
    () => {

      duplications = new Duplication(
        new p5.SoundFile(soundFile.getBlob()),
        new p5.SoundFile(soundFile.getBlob()),
        new p5.SoundFile(soundFile.getBlob()));

    });
}

function stopRecording() {

  recorder.stop();
}

function playOriginal() {

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
