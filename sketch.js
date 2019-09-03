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
  // constants
  N_LEFT;
  N_DOWN;
  maxBallSpeed;

  // stats
  playerSize;
  player1StartingPosition;
  player2StartingPosition;
  playerMoveSpeed;
  ballStartingVelocity;

  // helpers
  shouldUpdateBall;

  player1;
  player2;
  ball;
  score;

  constructor() {
    this.N_LEFT = createVector(1, 0); // unit vector
    this.N_DOWN = createVector(0, 1); // unit vector
    this.maxBallSpeed = 20;
    this.playerSize = { width: 10, height: 70 };
    this.player1StartingPosition = createVector(10, windowHeight / 2);
    this.player2StartingPosition = createVector(windowWidth - 10, windowHeight / 2);
    this.playerMoveSpeed = 5;
    this.ballStartingVelocity = createVector(0, 0); //-2.5, 10.2); // TODO: set as random (in range) in reset method
    this.resetGame();
  }

  draw() {
    this.movePlayers();
    this.player1.draw();
    this.player2.draw();
    this.ball.draw();
  }

  update() {
    this.player1.update();
    this.player2.update();
    if (this.shouldUpdateBall) {
      this.ball.update();
      this.detectCollision();
    }
  }

  movePlayers() {
    if (keyIsDown(UP_ARROW)) {
      this.player2.position.y -= this.playerMoveSpeed;
    } else if (keyIsDown(DOWN_ARROW)) {
      this.player2.position.y += this.playerMoveSpeed;
    }

    if (keyIsDown(87)) {
      this.player1.position.y -= this.playerMoveSpeed;
    } else if (keyIsDown(83)) {
      this.player1.position.y += this.playerMoveSpeed;
    }
  }

  detectCollision() {

    let sideDist = 10;  // should be smaller than maxBallSpeed

    // check collision with players
    if ((this.ball.position.x - this.ball.radius / 2 - this.maxBallSpeed < this.player1.position.x + this.player1.size.width / 2 &&
      this.ball.position.y - this.ball.radius / 2 < this.player1.position.y + this.player1.size.height / 2 &&
      this.ball.position.y + this.ball.radius / 2 > this.player1.position.y - this.player1.size.height / 2) ||
      (this.ball.position.x + this.ball.radius / 2 + this.maxBallSpeed > this.player2.position.x - this.player2.size.width / 2 &&
        this.ball.position.y - this.ball.radius / 2 < this.player2.position.y + this.player2.size.height / 2 &&
        this.ball.position.y + this.ball.radius / 2 > this.player2.position.y - this.player2.size.height / 2)) {
      console.log('Collision with a player');
      let d = this.ball.velocity;
      // TODO: modifiy reflection angle depending on the intersection point with the players bar
      this.ball.velocity = d.sub(p5.Vector.mult(this.N_LEFT, 2 * this.N_LEFT.dot(d))); // refelct with: r = d - 2 *(d.dot(n))n
    }
    // check if colliding with borders
    else if (this.ball.position.x + this.ball.radius / 2 > windowWidth - sideDist || this.ball.position.x - this.ball.radius / 2 < sideDist) { // left/right, out of game
      console.log('LEFT/RIGHT');
      this.shouldUpdateBall = false;
      // TODO:
      // timeout 
      // update score
      // reset game
      this.resetGame();
    } else if (this.ball.position.y + this.ball.radius / 2 > windowHeight - sideDist || this.ball.position.y - this.ball.radius / 2 < sideDist) {  // top/bottom
      console.log('TOP/BOTTOM');
      let d = this.ball.velocity;
      this.ball.velocity = d.sub(p5.Vector.mult(this.N_DOWN, 2 * this.N_DOWN.dot(d))); // refelct with: r = d - 2 *(d.dot(n))n
    }
  }

  resetGame() {
    this.shouldUpdateBall = true;
    this.player1 = new Player(this.player1StartingPosition, this.playerSize);
    this.player2 = new Player(this.player2StartingPosition, this.playerSize);
    this.ball = new Ball(createVector(windowWidth / 2, windowHeight / 2), this.ballStartingVelocity, 20);
    this.score = [0, 0];
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