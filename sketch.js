let mic, recorder, soundFile, soundMode;

let duplications;
//let modifiedSounds = [];

let state = 0;

let recordButton, playButton, duplicateButton;

function setup() {

  createCanvas(windowWidth, windowHeight);
  background(0);
  fill(225);
  textSize(50);
  textAlign(CENTER);
  text('Click to record', width / 2, height / 2);

  // create record button
  recordButton = createButton('record');
  recordButton.position(0, 0);
  recordButton.value = false;
  recordButton.mousePressed(() => {

    if (recordButton.value === false) {

      soundMode = 0;
      recorder.record(soundFile, null,
        () => {

          duplications = new Duplication(
            new p5.SoundFile(soundFile.getBlob()),
            new p5.SoundFile(soundFile.getBlob()),
            new p5.SoundFile(soundFile.getBlob()));

        });
      // record(soundFile, [duration], [callback])
      recordButton.value = true;
      recordButton.elt.innerText = 'stop';

    } else {

      recorder.stop();
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

    for (let i = 0; i < 3; i ++) {

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

    for (let i = 0; i < 3; i ++) {

      this.soundList[i].stop();
      this.isPlayed[i] = false;

    }

  }

}
