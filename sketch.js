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

  // helpers
  shouldUpdateBall;

  player1;
  player2;
  ball;

  constructor() {
    this.maxBallSpeed = 20;
    this.playerSize = { width: 10, height: 70 };
    this.shouldUpdateBall = true;
    this.player1 = new Player(createVector(10, windowHeight / 2), this.playerSize);
    this.player2 = new Player(createVector(windowWidth - 10, windowHeight / 2), this.playerSize);
    this.ball = new Ball(createVector(windowWidth / 2, windowHeight / 2), createVector(1, 10), 20);
  }

  draw() {
    this.player1.draw();
    this.player2.draw();
    this.ball.draw();
  }

  update() {
    this.player1.update();
    this.player2.update();
    if (this.shouldUpdateBall) {
      console.log(this.ball.position, this.ball.velocity);
      this.ball.update();
      this.detectCollision();
    }
  }

  detectCollision() {

    let sideDist = 20;

    // left/right, out of game
    if (this.ball.position.x > windowWidth - sideDist || this.ball.position.x < sideDist) {
      console.log('LEFT/RIGHT');
      this.shouldUpdateBall = false;
      // TODO:
      // timeout 
      // update score
      // start new
    } else if (this.ball.position.y > windowHeight - sideDist || this.ball.position.y < sideDist) {  // top/bottom
      console.log('TOP/BOTTOM');
      let n = createVector(0, 1); // unit vector
      let d = this.ball.velocity;
      this.ball.velocity = d.sub(p5.Vector.mult(n, 2 * n.dot(d))); // refelct with: r = d - 2 *(d.dot(n))n
    }

  }
}

class Player {
  position;
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
  position;
  velocity;
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
    this.position.add(this.velocity);
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