import "./style.css";
import p5 from 'p5';

const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(400, 400);
  };

  p.draw = () => {
    p.background(220);
    // Your p5.js drawing code here
  };
};

new p5(sketch);