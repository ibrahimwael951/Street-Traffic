import Phaser from "phaser";

declare global {
  interface Window {
    __PHASER_GAME__?: Phaser.Game | null;
  }
}

export default class TrafficGame extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private trafficCars!: Phaser.Physics.Arcade.Group;
  private roads: Phaser.GameObjects.Image[] = [];
  private score = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private speedText!: Phaser.GameObjects.Text;
  private policeText!: Phaser.GameObjects.Text;
  private gameRunning = true;
  private currentSpeed = 25;
  private readonly maxSpeed = 700;
  private readonly minSpeed = 60;
  private readonly acceleration = 5;
  private readonly deceleration = 5;
  private readonly turnSpeed = 400;
  private readonly baseTrafficSpeed = 500;
  private spawnTimer = 0;
  private spawnDelay = 1500;
  private trafficCarKeys: string[] = [];
  private policeActive = false;
  private policeLightTimer = 0;
  private lowSpeedTimer = 0;
  private readonly lowSpeedLimitMs = 5000;
  private kmh = 0;

  constructor() {
    super("TrafficGame");
  }

  preload(): void {
    this.load.image("road", "/road.png");
    this.load.image("player", "/player-car.png");
    this.load.image("traffic1", "/traffic-car1.png");
    this.load.image("traffic2", "/traffic-car2.png");
    this.load.image("traffic3", "/traffic-car3.png");
    this.load.image("traffic4", "/traffic-car4.png");
    this.load.image("traffic-fallback", "/traffic-car.png");
    this.load.image("police", "/police-car.png");
    this.load.image(
      "angry-face",
      "data:image/svg+xml;base64," +
        window.btoa(`
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="#ffcc99" stroke="#000" stroke-width="2"/>
        <circle cx="35" cy="40" r="5" fill="#000"/>
        <circle cx="65" cy="40" r="5" fill="#000"/>
        <path d="M35 70 Q50 55 65 70" stroke="#000" stroke-width="3" fill="none"/>
        <path d="M25 25 L40 35 M60 35 L75 25" stroke="#000" stroke-width="3"/>
      </svg>
    `)
    );
  }

  create(): void {
    this.trafficCarKeys = [
      "traffic1",
      "traffic2",
      "traffic3",
      "traffic4",
      "traffic-fallback",
    ];

    for (let i = 0; i < 3; i++) {
      const road = this.add.image(400, 300 - i * 600, "road");
      road.setDisplaySize(800, 600);
      this.roads.push(road);
    }

    this.player = this.physics.add.sprite(400, 500, "player");
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(600, 600);
    this.player.setDepth(2);

    this.trafficCars = this.physics.add.group();

    this.cursors = this.input!.keyboard!.createCursorKeys();

    this.physics.add.collider(
      this.player,
      this.trafficCars,
      this.handleCollision as any,
      undefined,
      this
    );

    this.scoreText = this.add
      .text(10, 10, "Score: 0", {
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "#00000077",
        padding: { x: 10, y: 5 },
      })
      .setDepth(5);

    this.speedText = this.add
      .text(10, 50, "Speed: 0 km/h", {
        fontSize: "20px",
        color: "#ffffff",
        backgroundColor: "#00000077",
        padding: { x: 10, y: 5 },
      })
      .setDepth(5);

    this.policeText = this.add
      .text(10, 90, "", {
        fontSize: "18px",
        color: "#ffdddd",
        backgroundColor: "#66000066",
        padding: { x: 10, y: 5 },
      })
      .setDepth(6)
      .setVisible(false);

    this.add
      .text(400, 560, "Use Arrow Keys: ← → Turn, ↑ Accelerate, ↓ Brake", {
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "#00000066",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setDepth(5);

    this.add
      .rectangle(400, 300, 800, 600, 0xff0000, 0.18)
      .setVisible(false)
      .setDepth(4)
      .setName("policeRed");
    this.add
      .rectangle(400, 300, 800, 600, 0x0000ff, 0.18)
      .setVisible(false)
      .setDepth(4)
      .setName("policeBlue");

    this.spawnTimer = 0;
    this.policeLightTimer = 0;
    this.lowSpeedTimer = 0;
    this.policeActive = false;
    this.gameRunning = true;
  }

  update(_time: number, delta: number): void {
    if (!this.gameRunning) return;

    if (this.cursors.up?.isDown) {
      this.currentSpeed = Math.min(
        this.currentSpeed + this.acceleration,
        this.maxSpeed
      );
    } else if (this.cursors.down?.isDown) {
      this.currentSpeed = Math.max(
        this.currentSpeed - this.deceleration * 2,
        this.minSpeed
      );
    } else {
      if (this.currentSpeed > this.minSpeed) {
        this.currentSpeed = Math.max(
          this.currentSpeed - this.deceleration * 0.5,
          this.minSpeed
        );
      } else if (this.currentSpeed < this.minSpeed) {
        this.currentSpeed = Math.min(
          this.currentSpeed + this.deceleration * 0.5,
          this.minSpeed
        );
      }
    }

    this.kmh = Math.floor((Math.abs(this.currentSpeed) / this.maxSpeed) * 200);
    this.speedText.setText("Speed: " + this.kmh + " km/h");

    const roadSpeed = this.currentSpeed * 1.5;
    this.roads.forEach((road) => {
      road.y += roadSpeed * (delta / 1000) * 60;
      if (road.y > 900) {
        road.y -= 3 * 600;
      }
    });

    const absSpeed = Math.abs(this.currentSpeed);
    const turnForce =
      absSpeed === 50
        ? (this.maxSpeed / absSpeed) * this.turnSpeed
        : this.turnSpeed;
    if (this.cursors.left?.isDown && absSpeed > 5) {
      this.player.setVelocityX(-turnForce);
      this.player.setRotation(-0.12);
    } else if (this.cursors.right?.isDown && absSpeed > 5) {
      this.player.setVelocityX(turnForce);
      this.player.setRotation(0.12);
    } else {
      this.player.setVelocityX(0);
      this.player.setRotation(0);
    }
    this.player.setVelocityY(0);

    if (this.currentSpeed > 0) {
      this.score += Math.floor((this.currentSpeed / 50) * (delta / 16.67));
    }
    this.scoreText.setText("Score: " + this.score);

    this.trafficCars.children.entries.forEach((car) => {
      const sprite = car as Phaser.GameObjects.Sprite & { y?: number };
      if (sprite.y && sprite.y > 700) sprite.destroy();
    });

    this.spawnDelay = Math.max(400, 800 - this.score / 100);
    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnDelay) {
      this.spawnTraffic();
      this.spawnTimer = 0;
    }

    if (this.kmh >= 150) {
      if (!this.policeActive) {
        this.policeActive = true;
        this.policeText.setText("POLICE: ON ALERT!");
        this.policeText.setVisible(true);
      }
      this._flashPoliceLights(delta);
    } else {
      this._stopPoliceLights();
      if (this.policeActive) {
        this.policeText.setText("POLICE: ON ALERT (reduce carefully)");
        this.policeText.setVisible(true);
      } else {
        this.policeText.setVisible(false);
      }
    }

    if (this.policeActive) {
      if (this.kmh < 50) {
        this.lowSpeedTimer += delta;
        const secondsLeft = Math.max(
          0,
          Math.ceil((this.lowSpeedLimitMs - this.lowSpeedTimer) / 1000)
        );
        this.policeText.setText(
          `POLICE: ON ALERT — slow speed detected (${secondsLeft}s to arrest)`
        );
        if (this.lowSpeedTimer >= this.lowSpeedLimitMs) {
          this.policeCatch();
        }
      } else {
        if (this.lowSpeedTimer > 0) {
          this.lowSpeedTimer = 0;
          this.policeText.setText("POLICE: ON ALERT!");
        }
      }
    }
  }

  private _flashPoliceLights(delta: number): void {
    this.policeLightTimer += delta;
    const flashOn = Math.floor(this.policeLightTimer / 150) % 2 === 0;
    const red = this.children.getByName("policeRed") as
      | Phaser.GameObjects.Rectangle
      | undefined;
    const blue = this.children.getByName("policeBlue") as
      | Phaser.GameObjects.Rectangle
      | undefined;
    if (red) red.setVisible(flashOn);
    if (blue) blue.setVisible(!flashOn);
  }

  private _stopPoliceLights(): void {
    const red = this.children.getByName("policeRed") as
      | Phaser.GameObjects.Rectangle
      | undefined;
    const blue = this.children.getByName("policeBlue") as
      | Phaser.GameObjects.Rectangle
      | undefined;
    if (red) red.setVisible(false);
    if (blue) blue.setVisible(false);
    this.policeLightTimer = 0;
  }

  private spawnTraffic(): void {
    if (!this.gameRunning) return;
    const x = Phaser.Math.Between(120, 680);
    const carKey = Phaser.Utils.Array.GetRandom(this.trafficCarKeys);
    const trafficCar = this.trafficCars.create(
      x,
      -80,
      carKey
    ) as Phaser.Physics.Arcade.Sprite;
    trafficCar.setDepth(1);

    const scaledPlayerSpeed = Math.max(this.currentSpeed, this.minSpeed);
    const baseSpeed =
      this.baseTrafficSpeed + scaledPlayerSpeed * 0.8 + this.score / 100;
    const speedVariance = Phaser.Math.Between(-50, 100);
    const carSpeed = Math.max(60, Math.floor(baseSpeed + speedVariance));

    trafficCar.setVelocityY(carSpeed);
    trafficCar.setCollideWorldBounds(false);
    trafficCar.setRotation(Phaser.Math.FloatBetween(-0.06, 0.06));
    trafficCar.setImmovable(true);

    if (
      trafficCar.body &&
      (trafficCar.body as Phaser.Physics.Arcade.Body).setSize
    ) {
      (trafficCar.body as Phaser.Physics.Arcade.Body).setSize(
        (trafficCar.width ?? 0) * 0.7,
        (trafficCar.height ?? 0) * 0.8,
        true
      );
    }
  }

  private handleCollision = (
    _playerObj: any,
    _trafficCarObj: any
  ): void => {
    if (!this.gameRunning) return;
    this.gameRunning = false;
    this.physics.pause();

    this.policeText.setVisible(false);

    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8).setDepth(10);
    this.add.image(400, 180, "angry-face").setScale(1.6).setDepth(11);

    const angryComments = [
      "Terrible driving!",
      "You call that driving?!",
      "My grandma drives better!",
      "Did you get your license from a cereal box?",
      "That was pathetic!",
      "Learn to drive!",
      "You're a menace on the road!",
      "Epic fail!",
    ];
    const randomComment =
      angryComments[Math.floor(Math.random() * angryComments.length)];

    this.add
      .text(400, 260, "GAME OVER!", {
        fontSize: "48px",
        color: "#ff0000",
      })
      .setOrigin(0.5)
      .setDepth(11);

    this.add
      .text(400, 320, randomComment, {
        fontSize: "24px",
        color: "#ffff00",
      })
      .setOrigin(0.5)
      .setDepth(11);

    this.add
      .text(400, 370, `Final Score: ${this.score}`, {
        fontSize: "28px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(11);

    this.cameras.main?.shake(800, 0.02);
  };

  private policeCatch(): void {
    if (!this.gameRunning) return;
    this.gameRunning = false;
    this.physics.pause();

    this.policeText.setVisible(false);

    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85).setDepth(20);
    this.add.image(400, 200, "police").setScale(1.6).setDepth(21);

    this.add
      .text(400, 320, "POLICE CAUGHT YOU!", {
        fontSize: "48px",
        color: "#ff0000",
      })
      .setOrigin(0.5)
      .setDepth(21);

    this.add
      .text(400, 380, `Final Score: ${this.score}`, {
        fontSize: "28px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(21);

    this.add
      .text(
        400,
        430,
        "You were caught after slowing down while police were active.",
        {
          fontSize: "18px",
          color: "#ffffff",
        }
      )
      .setOrigin(0.5)
      .setDepth(21);

    this.cameras.main?.shake(1000, 0.03);
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  backgroundColor: "#2d2d2d",
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: { x: 0, y: 0 },
    },
  },
  scene: TrafficGame,
};

export function launchGame(): Phaser.Game {
  if (window.__PHASER_GAME__) {
    try {
      window.__PHASER_GAME__.destroy(true);
    } catch (e) {
      // ignore
    }
    const container = document.getElementById("game-container");
    if (container) container.innerHTML = "";
    window.__PHASER_GAME__ = null;
  }

  const game = new Phaser.Game(config);
  window.__PHASER_GAME__ = game;
  return game;
}
