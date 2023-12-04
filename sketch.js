let mic, recorder, soundFile, soundFile2;
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

      recorder.record(soundFile);
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
  playButton.value = false;
  playButton.mousePressed(() => {

    if (playButton.value === false) {

      if (soundFile.buffer) soundFile.play();
      playButton.value = true;
      playButton.elt.innerText = 'pause';

    } else {

      soundFile.pause();
      playButton.value = false;
      playButton.elt.innerText = 'play';

    }
  });

  // create duplicate button
  duplicateButton = createButton('duplicate');
  duplicateButton.position(0, 60);
  duplicateButton.mousePressed(() => {

    soundFile2 = new p5.SoundFile(soundFile.getBlob(),

      () => {

        console.log(soundFile);
        console.log(soundFile2);
        soundFile2.play();

      }


    );

  })

  // create an audio in
  mic = new p5.AudioIn();
  mic.start();

  recorder = new p5.SoundRecorder();
  recorder.setInput(mic);

  soundFile = new p5.SoundFile();
  soundFile.playMode('sustain');
  soundFile.onended(() => {

    playButton.value = false;
    playButton.elt.innerText = 'play';

  });

}

function draw() {

}

