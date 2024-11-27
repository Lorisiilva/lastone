let pointCount = 0.9;
let speed = 100;
let comebackSpeed = 100;
let dia = 200;
let randomPos = false;
let pointsDirection = "up";
let interactionDirection = -1;
let textPoints = [];
let soundEffect;
let isDissolved = false;
let tposX, tposY;
let tSize = 100; // Text size
let texts = ["LORIS SPACE", "ART WORK", "CODES", "CONTACT", "GRAPHICS"];
let currentTextIndex = 0;
let bgColor = [80, 50, 130]; // Initial purple background color
let particles = [];  // Array for swirling particles
let swirlSpeed = 2; // Speed of the swirl motion
let planets = []; // Array for planets
let spaceMode = false; // Flag to indicate space mode

function preload() {
  font = loadFont("AvenirNextLTPro-Demi.otf");
  soundEffect = loadSound("click.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(font);
  setTextPosition();
  generateTextParticles(texts[currentTextIndex]);

  // Create initial swirl particles
  for (let i = 0; i < 200; i++) {
    particles.push(new SwirlParticle(random(width), random(height), random(1, 3), random(0, TWO_PI)));
  }
}

function draw() {
  background(bgColor);

  // Draw the swirling particles that create a frame around the canvas
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.update();
    p.show();
  }

  // If in space mode, draw the planets (words as planets)
  if (spaceMode) {
    for (let i = 0; i < planets.length; i++) {
      planets[i].move();
      planets[i].show();
    }
  }

  // Update and show text particles
  for (let i = 0; i < textPoints.length; i++) {
    let v = textPoints[i];
    v.update();
    v.show();

    if (isDissolved) {
      v.behaviors();
    } else {
      v.returnToStart();
    }
  }
}

function mouseMoved() {
  isDissolved = true;
}

function mousePressed() {
  soundEffect.play();

  // Change background color on click
  bgColor = [random(100, 170), random(50, 100), random(130, 200)];
  
  if (texts[currentTextIndex] === "LORIS SPACE") {
    // Activate space mode when "LORIS SPACE" is clicked
    spaceMode = true;

    // Create planets for space mode
    createPlanets();

    // Regenerate swirling particles
    particles = [];
    for (let i = 0; i < 200; i++) {
      particles.push(new SwirlParticle(random(width), random(height), random(1, 3), random(0, TWO_PI)));
    }
  }

  // Cycle through texts
  currentTextIndex = (currentTextIndex + 1) % texts.length;
  setTextPosition();
  generateTextParticles(texts[currentTextIndex]);

  // If we switch back to LORIS SPACE, we restart the space mode
  if (texts[currentTextIndex] === "LORIS SPACE") {
    spaceMode = false; // Exit space mode when clicking "LORIS SPACE"
    planets = []; // Clear planets
  }
}

function setTextPosition() {
  tposX = width / 2 - (textWidth(texts[currentTextIndex]) / 2);
  tposY = height / 2 + tSize / 4;
}

function generateTextParticles(text) {
  textPoints = [];
  let points = font.textToPoints(text, tposX, tposY, tSize, { sampleFactor: pointCount });

  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    let textPoint = new Interact(pt.x, pt.y, speed, dia, randomPos, comebackSpeed, pointsDirection, interactionDirection, pastelPurpleColor());
    textPoints.push(textPoint);
  }
}

// Function to generate purple shades for particles and background
function pastelPurpleColor() {
  let r = random(150, 255); 
  let g = random(80, 150);
  let b = random(150, 255);
  return color(r, g, b, 200); 
}

// Interact class for text particles
function Interact(x, y, m, d, t, s, di, p, col) {
  this.home = createVector(x, y);
  this.pos = this.home.copy();
  this.target = createVector(x, y);
  this.vel = createVector();
  this.acc = createVector();
  this.r = 8;
  this.maxSpeed = m;
  this.maxForce = 0.1;
  this.dia = d;
  this.come = s;
  this.dir = p;
  this.color = col;
}

Interact.prototype.hasArrived = function () {
  return p5.Vector.dist(this.pos, this.target) < 5;
};

Interact.prototype.behaviors = function () {
  let arrive = this.arrive(this.target);
  let mouse = createVector(mouseX, mouseY);
  let flee = this.flee(mouse);

  this.applyForce(arrive);
  this.applyForce(flee);
};

Interact.prototype.applyForce = function (f) {
  this.acc.add(f);
};

Interact.prototype.arrive = function (target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();
  let speed = this.maxSpeed;
  if (d < this.come) {
    speed = map(d, 0, this.come, 0, this.maxSpeed);
  }
  desired.setMag(speed);
  let steer = p5.Vector.sub(desired, this.vel);
  steer.limit(this.maxForce);
  return steer;
};

Interact.prototype.flee = function (target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();

  if (d < this.dia) {
    desired.setMag(this.maxSpeed);
    desired.mult(this.dir);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  } else {
    return createVector(0, 0);
  }
};

Interact.prototype.update = function () {
  this.pos.add(this.vel);
  this.vel.add(this.acc);
  this.acc.mult(0);
};

Interact.prototype.show = function () {
  stroke(this.color);
  strokeWeight(4);
  point(this.pos.x, this.pos.y);
};

Interact.prototype.returnToStart = function () {
  this.target = this.home;
};

Interact.prototype.resetPosition = function () {
  this.pos = this.home.copy();
  this.vel.mult(0);
};

// SwirlParticle class for random swirling particles
class SwirlParticle {
  constructor(x, y, speed, angle) {
    this.pos = createVector(x, y);
    this.vel = createVector(cos(angle) * speed, sin(angle) * speed);
    this.acc = createVector();
    this.size = random(5, 10);
    this.life = 255;
  }

  update() {
    // Apply a slight acceleration in random directions to simulate a swirling motion
    let force = createVector(random(-0.1, 0.1), random(-0.1, 0.1));
    this.acc.add(force);
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);

    // Decrease life to make particles fade out
    this.life -= 1;
    if (this.life <= 0) {
      this.life = 0;
    }
  }

  show() {
    noStroke();
    fill(150, 100, 200, this.life); // Purple hues with fading effect
    ellipse(this.pos.x, this.pos.y, this.size, this.size);
  }
}

// Planet class for planets that move around the space
class Planet {
  constructor(name, radius, angle, speed) {
    this.name = name;
    this.radius = radius;
    this.angle = angle;
    this.speed = speed;
    this.pos = createVector(width / 2 + this.radius * cos(this.angle), height / 2 + this.radius * sin(this.angle));
    this.size = 30;
  }

  move() {
    this.angle += this.speed;
    this.pos.x = width / 2 + this.radius * cos(this.angle);
    this.pos.y = height / 2 + this.radius * sin(this.angle);
  }

  show() {
    fill(255, 200, 200);
    ellipse(this.pos.x, this.pos.y, this.size, this.size);
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(12);
    text(this.name, this.pos.x, this.pos.y);
  }
}

// Function to create planets
function createPlanets() {
  planets.push(new Planet("CONTACT", 150, 0, 0.02));
  planets.push(new Planet("CODES", 200, PI / 2, 0.015));
  planets.push(new Planet("ART WORK", 250, PI, 0.01));
  planets.push(new Planet("GRAPHICS", 300, -PI / 2, 0.03));
}
