import {
  Canvas,
  Color,
  Event,
  EventType,
  Font,
  TextureCreator,
  Rect,
  Window,
  WindowBuilder,
} from "jsr:@divy/sdl2@0.10.1";

const window = new WindowBuilder("Pong", 800, 600)
  .build();

class Pong {
  window: Window;
  canvas: Canvas;

  leftPaddle: Paddle;
  rightPaddle: Paddle;
  ball: Ball;

  font: Font;
  creator: TextureCreator;

  constructor(window: Window) {
    this.window = window;
    this.canvas = window.canvas();

    this.leftPaddle = new Paddle(50, (400 / 2) - 50, 26, 22);
    this.rightPaddle = new Paddle(800 - 50 - 20, (400 / 2) - 50, 82, 81);
    this.ball = new Ball(400, 300, 3);

    this.font = this.canvas.loadFont("./jetbrains-mono.ttf", 24);

    this.creator = this.canvas.textureCreator();
  }

  update(dt: number) {
    this.leftPaddle.update(dt);
    this.rightPaddle.update(dt);
    this.ball.update(dt);

    if (
      checkCollision(this.ball, this.leftPaddle) ||
      checkCollision(this.ball, this.rightPaddle)
    ) {
      this.ball.velocityX = -this.ball.velocityX;
    }

    if (this.ball.y < 0 || this.ball.y > 600) {
      this.ball.velocityY = -this.ball.velocityY;
    } else if (this.ball.x < 0 || this.ball.x > 800) {
      const winner = this.ball.x >= 800 ? "Left" : "Right";

      this.ball = new Ball(400, 300, 3);
      if (winner === "Left") {
        this.leftPaddle.score++;
      } else {
        this.rightPaddle.score++;
      }
    }

    if (this.leftPaddle.y < 0) {
      this.leftPaddle.y = 0;
    } else if (this.leftPaddle.y > 500) {
      this.leftPaddle.y = 500;
    }

    if (this.rightPaddle.y < 0) {
      this.rightPaddle.y = 0;
    } else if (this.rightPaddle.y > 500) {
      this.rightPaddle.y = 500;
    }
  }

  draw() {
    this.canvas.clear();

    this.leftPaddle.draw(this.canvas);
    this.rightPaddle.draw(this.canvas);
    this.ball.draw(this.canvas);

    const surface = this.font.renderSolid(`Score: ${this.leftPaddle.score} | ${this.rightPaddle.score}`, new Color(255, 255, 255));
    const scoreTexture = this.creator.createTextureFromSurface(surface);
	const query = scoreTexture.query();
    this.canvas.copy(scoreTexture, null, new Rect(10, 10, query.w, query.h));

    this.canvas.present();
  }

  async gameLoop() {
    for await (const event of window.events()) {
      if (event.type === EventType.Quit) {
        break;
      }

      this.leftPaddle.handleInput(event);
      this.rightPaddle.handleInput(event);

      if (event.type == EventType.Draw) {
        this.update(1.0 / 60.0);
        this.draw();
      }
    }
  }
}

function checkCollision(ball: Ball, paddle: Paddle): boolean {
  return ball.x < paddle.x + 20 && ball.x + 20 > paddle.x &&
    ball.y < paddle.y + 100 && ball.y + 20 > paddle.y;
}

class Paddle {
  x: number;
  y: number;

  direction: "up" | "down" | "none" = "none";
  velocity = 2;

  score = 0;

  up: number;
  down: number;

  constructor(x: number, y: number, up: number, down: number) {
    this.x = x;
    this.y = y;
    this.up = up;
    this.down = down;
  }

  handleInput(event: Event) {
    if (event.type === EventType.KeyDown) {
      if (event.keysym.scancode === this.down) {
        this.direction = "down";
      } else if (event.keysym.scancode === this.up) {
        this.direction = "up";
      }
    }
  }

  update(dt: number) {
    if (this.direction === "up") {
      this.y -= this.velocity * dt;
    } else if (this.direction === "down") {
      this.y += this.velocity * dt;
    }
  }

  draw(canvas: Canvas) {
    canvas.setDrawColor(255, 255, 255, 255);
    canvas.fillRect(this.x, this.y, 20, 100);
    canvas.setDrawColor(0, 0, 0, 255);
  }
}

class Ball {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;

  constructor(x: number, y: number, velocity: number) {
    this.x = x;
    this.y = y;
    this.velocityX = Math.random() > 0.5 ? velocity : -velocity;
    this.velocityY = Math.random() > 0.5 ? velocity : -velocity;
  }

  update(dt: number) {
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;
  }

  draw(canvas: Canvas) {
    canvas.setDrawColor(255, 255, 255, 255);
    canvas.fillRect(this.x, this.y, 20, 20);
    canvas.setDrawColor(0, 0, 0, 255);
  }
}

const pong = new Pong(window);
await pong.gameLoop();
