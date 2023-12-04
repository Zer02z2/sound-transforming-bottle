let mic, recorder, soundFile;

let state = 0;

function setup() {

  createCanvas(windowWidth, windowHeight);
  background(0);
  fill(225);
  textSize(50);
  textAlign(CENTER);
  text('Click to record', width / 2, height / 2);

  // create an audio in
  mic = new p5.AudioIn();
  mic.start();

  recorder = new p5.SoundRecorder();
  recorder.setInput(mic);

  soundFile = new p5.SoundFile();

}

function draw() {

}

function mousePressed() {

  if (state === 0 && mic.enabled) {

    recorder.record(soundFile);
    background(0);
    text('Recording now! Click to stop.', width / 2, height / 2);
    state ++;

  } else if (state === 1) {

    recorder.stop();
    background(0);
    text('Recording stopped. Click to play & save', width / 2, height / 2);
    state ++;

  } else if (state === 2) {

    soundFile.play();
    background(0);
    text('Click to record', width / 2, height / 2);
    state = 0;
  }
}
