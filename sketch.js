let player1;
let player2;
let playerSize = { width: 10, height: 70 };
let ball;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  player1 = new Player({ x: 10, y: 10 }, playerSize);
  player2 = new Player({ x: windowWidth - 10 - playerSize.width, y: 10 }, playerSize);

  ball = new Ball({x : windowWidth / 2, y: windowHeight / 2}, 20);
}

function draw() {  
  player1.update();
  player2.update();

  player1.draw();
  player2.draw();

  ball.draw();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}

class Player {
  position = { x: undefined, y: undefined };
  size = { width: undefined, height: undefined };

  constructor(startPosition, startSize) {
    this.position = startPosition;
    this.size = startSize;
  }

  draw() {
    rect(this.position.x, this.position.y, this.size.width, this.size.height);
  }

  update(){

  }
}

class Ball {
  position = { x: undefined, y: undefined };
  radius;

  constructor(startPosition, radius) {
    this.position = startPosition;
    this.radius = radius;
  }

  draw() {
    rect(this.position.x, this.position.y, this.radius, this.radius);
  }

  update(){

  }
}