import p5 from 'p5';

export default function sketch(p) {

  let backgroundGUI;
  let game;
  const margin = [20, 20];  // top/bottom, left/right
  // TODO: set proper fullscreen
  const width = window.innerWidth - margin[1];
  const height = window.innerHeight - margin[0];

  p.setup = function () {
    p.createCanvas(width, height);
    p.background(0);  // black background

    // drawing setup
    p.stroke(255);  // white
    p.rectMode(p.CENTER);

    backgroundGUI = new Background();
    backgroundGUI.draw();

    game = new Game();
    game.draw();
  }

  p.draw = function () {
    p.background(0);
    backgroundGUI.draw();

    game.update();
    game.draw();
  }

  p.windowResized = function () {
    p.resizeCanvas(width, height);
    p.background(0);
  }

  p.keyPressed = function () {
    if (p.keyIsDown(32)) {
      if (game) {
        game.startStop(); // toggle start/stop
        return false; // prevent default
      }
    }
  }

  class Game {
    // physics
    // constants
    N_LEFT;
    N_DOWN;
    maxBallSpeed;

    borderWidth;  // should be smaller than maxBallSpeed

    // stats
    playerSize;
    player1StartingPosition;
    player2StartingPosition;
    playerMoveSpeed;

    // helpers
    isStopped;

    player1;
    player2;
    ball;
    score;

    constructor() {
      this.N_LEFT = p.createVector(1, 0); // unit vector
      this.N_DOWN = p.createVector(0, 1); // unit vector
      this.maxBallSpeed = 15;
      this.borderWidth = 10;
      this.playerSize = { width: 10, height: 80 };
      this.player1StartingPosition = p.createVector(10, height / 2);
      this.player2StartingPosition = p.createVector(width - 10, height / 2);
      this.playerMoveSpeed = 5 * height / 500;  // empirical value
      this.score = [0, 0];
      this.resetRound();
    }

    draw() {
      this.player1.draw();
      this.player2.draw();
      this.ball.draw();
      this.drawScore();
    }

    drawScore() {
      p.textSize(64);
      p.textAlign(p.CENTER, p.CENTER);
      p.fill(255);
      let gap = 40;
      p.text(this.score[0], width / 2 - gap, 40);
      p.text(this.score[1], width / 2 + gap, 40);
    }

    update() {
      if (!this.isStopped) {
        this.player1.update();
        this.player2.update();
        this.movePlayers();
        this.ball.update();
        this.detectCollision();
      }
    }

    startStop() {
      this.isStopped = !this.isStopped;
    }

    movePlayers() {
      if (p.keyIsDown(p.UP_ARROW) && this.player2.position.y - this.player2.size.height / 2 > this.borderWidth) {
        this.player2.position.y -= this.playerMoveSpeed;
      } else if (p.keyIsDown(p.DOWN_ARROW) && this.player2.position.y + this.player2.size.height / 2 < height - this.borderWidth) {
        this.player2.position.y += this.playerMoveSpeed;
      }

      if (p.keyIsDown(87) && this.player1.position.y - this.player1.size.height / 2 > this.borderWidth) {
        this.player1.position.y -= this.playerMoveSpeed;
      } else if (p.keyIsDown(83) && this.player1.position.y + this.player1.size.height / 2 < height - this.borderWidth) {
        this.player1.position.y += this.playerMoveSpeed;
      }
    }

    detectCollision() {
      // check collision with players
      if ((this.ball.position.x - this.ball.radius / 2 - this.maxBallSpeed < this.player1.position.x + this.player1.size.width / 2 &&
        this.ball.position.y - this.ball.radius / 2 < this.player1.position.y + this.player1.size.height / 2 &&
        this.ball.position.y + this.ball.radius / 2 > this.player1.position.y - this.player1.size.height / 2) ||
        (this.ball.position.x + this.ball.radius / 2 + this.maxBallSpeed > this.player2.position.x - this.player2.size.width / 2 &&
          this.ball.position.y - this.ball.radius / 2 < this.player2.position.y + this.player2.size.height / 2 &&
          this.ball.position.y + this.ball.radius / 2 > this.player2.position.y - this.player2.size.height / 2)) {
        console.log('Collision with a player');
        // TODO: modifiy reflection angle depending on the intersection point with the players bar
        this.ball.velocity = reflectVector(this.N_LEFT, this.ball.velocity);
        this.ball.acceleration = reflectVector(this.N_LEFT, this.ball.acceleration);
      }
      // check if colliding with borders
      else if (this.ball.position.x + this.ball.radius / 2 > width - this.borderWidth || this.ball.position.x - this.ball.radius / 2 < this.borderWidth) { // left/right, out of game
        console.log('LEFT/RIGHT');
        let scoreIdx = +!(this.ball.position.x + this.ball.radius / 2 > width - this.borderWidth)
        this.score[scoreIdx]++;
        this.resetRound(false);
      } else if (this.ball.position.y + this.ball.radius / 2 > height - this.borderWidth || this.ball.position.y - this.ball.radius / 2 < this.borderWidth) {  // top/bottom
        console.log('TOP/BOTTOM');
        this.ball.velocity = reflectVector(this.N_DOWN, this.ball.velocity);
        this.ball.acceleration = reflectVector(this.N_DOWN, this.ball.acceleration);
      }
    }

    resetRound(start = true) {
      console.log('reset');
      this.isStopped = !start;
      this.player1 = new Player(this.player1StartingPosition.copy(), this.playerSize);
      this.player2 = new Player(this.player2StartingPosition.copy(), this.playerSize);
      let ballStartingVelocity = p.createVector(rand(-5, 5), rand(-2.5, 2.5));
      let ballStartingAccelartion = ballStartingVelocity.copy().mult(rand(0.001, 0.01));  // Has to go in the same direction
      this.ball = new Ball(p.createVector(width / 2, height / 2), ballStartingVelocity, ballStartingAccelartion, 20, this.maxBallSpeed);
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
      p.rect(this.position.x, this.position.y, this.size.width, this.size.height);
    }

    update() {
    }
  }

  class Ball {
    position;
    velocity;
    acceleration;
    radius;
    maxSpeed;

    constructor(startPosition, velocity, acceleration, radius, maxSpeed) {
      this.position = startPosition;
      this.velocity = velocity.limit(maxSpeed);
      this.acceleration = acceleration;
      this.radius = radius;
      this.maxSpeed = maxSpeed;
    }

    draw() {
      p.rect(this.position.x, this.position.y, this.radius, this.radius);
    }

    update() {
      this.position.add(this.velocity);
      this.velocity.add(this.acceleration);
      this.velocity.limit(this.maxSpeed);
    }
  }

  class Background {

    dashDist;

    constructor() {
      this.dashDist = 10;
    }

    draw() {
      for (let i = 0; i < height; i += this.dashDist) {
        p.line(width / 2, i, width / 2, i + this.dashDist / 2);
      }
    }

    update() {

    }

  }

  function reflectVector(normal, vec) {
    return vec.sub(p5.Vector.mult(normal, 2 * normal.dot(vec))); // r = d - 2 *(d.dot(n))n
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }
};