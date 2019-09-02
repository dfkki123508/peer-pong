let backgroundGUI;
let game;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);  // black background

  // drawing setup
  stroke(255);  // white
  rectMode(CENTER);

  backgroundGUI = new Background();
  backgroundGUI.draw();

  game = new Game();
  game.draw();

}

function draw() {
  background(0);
  backgroundGUI.draw();

  game.update();
  game.draw();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}

class Game {
  // physics
  maxBallSpeed;

  // stats
  playerSize;

  player1;
  player2;
  ball;

  constructor() {
    this.maxBallSpeed = 20;
    this.playerSize = { width: 10, height: 70 };
    this.player1 = new Player({ x: 10, y: windowHeight / 2 }, this.playerSize);
    this.player2 = new Player({ x: windowWidth - 10, y: windowHeight / 2 }, this.playerSize);
    this.ball = new Ball({ x: windowWidth / 2, y: windowHeight / 2 }, {x: 5, y: 1}, 20);
  }

  draw() {
    this.player1.draw();
    this.player2.draw();
    this.ball.draw();
  }

  update() {
    this.player1.update();
    this.player2.update();
    this.ball.update();
  }

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

  update() {

  }
}

class Ball {
  position = { x: undefined, y: undefined };
  velocity = { x: undefined, y: undefined };
  radius;

  constructor(startPosition, velocity, radius) {
    this.position = startPosition;
    this.velocity = velocity;
    this.radius = radius;
  }

  setVelocity(velocity) {
    this.velocity = velocity;
  }

  draw() {
    rect(this.position.x, this.position.y, this.radius, this.radius);
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Background {

  dashDist;

  constructor() {
    this.dashDist = 10;
  }

  draw() {
    for (let i = 0; i < windowHeight; i += this.dashDist) {
      line(windowWidth / 2, i, windowWidth / 2, i + this.dashDist / 2);
    }
  }

  update() {

  }

}