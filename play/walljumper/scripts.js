
// ------------- SET RANDOM THEME -------------

var theme = randomInteger(2, 5);
console.log(theme);

// Matrix: Green Black
if(theme === 2){
  document.documentElement.style.setProperty('--color-primary', '#00D200');
  document.documentElement.style.setProperty('--color-bg', '#000300');
}

// Blue Black
if(theme === 3){
  document.documentElement.style.setProperty('--color-primary', '#4D38DB');
  document.documentElement.style.setProperty('--color-bg', '#07140B');
}

// White Blue
if(theme === 4){
  document.documentElement.style.setProperty('--color-primary', '#ECFFFF');
  document.documentElement.style.setProperty('--color-bg', '#0100FF');
}

// Red Dark
if(theme === 5){
  document.documentElement.style.setProperty('--color-primary', '#F40909');
  document.documentElement.style.setProperty('--color-bg', '#240E00');
}

// ------------- SET CANVAS SIZE -------------
// Based on the full screen size of the device  
// in landsape and pixel resolution

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var screenMax = Math.max(window.screen.width, window.screen.height);
var screenMin = Math.min(window.screen.width, window.screen.height);

canvas.dpr = window.devicePixelRatio || 1;
canvas.width = screenMax * canvas.dpr;
canvas.height = screenMin * canvas.dpr;

// ------------- SCALE MAIN CONTAINER -------------
// Run on load and whenever the window is resized

scaleMainContainer();
window.addEventListener("resize", scaleMainContainer);

function scaleMainContainer(){
  // Set fixed pixel size for main container
  var container = document.getElementById("main-container");
  var rawWidth = 1200; // Fixed design
  var rawHeight = screenMin * (rawWidth / screenMax);

  container.style.width = rawWidth + "px";
  container.style.height = rawHeight + "px";

  // Scale and position to fit inside browser window
  var scale = Math.min( (window.innerWidth/rawWidth), (window.innerHeight/rawHeight) );
  container.style.transform = 'scale(' + scale + ')';
  container.style.marginLeft = rawWidth * -0.5 + "px";
  container.style.marginTop =  rawHeight * -0.5 + "px";
  container.style.transformOrigin = "center center";
  container.style.left = "50%";
  container.style.top = "50%";
}

// ------------- CANVAS PERCENT UNITS -------------
// Functions to return a pixel value when given a percent 
// value for the height and width of the canvas

canvas.h = function(percent){
  return percent * (canvas.height * 0.01)
}

canvas.w = function(percent) {
  return percent * (canvas.width * 0.01)
}

// ------------- MAIN GAME LOOP -------------

var animationLoopId;
var lastDrawTime;

function runGameLoop(){
  //Recursive request
  animationLoopId = requestAnimationFrame(runGameLoop);
  //Calculate time passed since last draw
  frameDuration = (Date.now() - (lastDrawTime || Date.now()));
  lastDrawTime = Date.now();

  console.log(frameDuration);

  // Do stuff
  player.tick();
  world.tick();
  world.draw();
  player.draw();
}


// ------------- START GAME -------------

function startGame(){
  animationLoopId = requestAnimationFrame(runGameLoop);
  document.getElementById("start-screen").style.display = "none";
}


// ------------- END GAME -------------

function endGame(){
  cancelAnimationFrame(animationLoopId);
  document.getElementById("end-screen").style.display = "block";


  // Calculate values
  var speedReading = Math.round(world.speed * 100);
  var guagePercent = (speedReading - 100) / 2; // 100~300 = 0~100
  if (guagePercent >= 100) { guagePercent = 100 }

  // Update the Guage
  animateValue(speedReading);
  animateGuage(guagePercent);
}

function animateValue(end) {
    var start = 100;
    var duration = 500;
    var range = end - start;
    var current = start;
    var increment = end > start? 1 : -1;
    var stepTime = Math.abs(Math.floor(duration / range));
    var timer = setInterval(function() {
        current += increment;
        document.getElementById("guage-reading").innerHTML = current;
        if (current >= end) {
            clearInterval(timer);
        }
    }, stepTime);
}

function animateGuage(end) {
    var start = 0;
    var duration = 500;
    var range = end - start;
    var current = start;
    var increment = end > start? 1 : -1;
    var stepTime = Math.abs(Math.floor(duration / range));
    var timer = setInterval(function() {
        current += increment;
        document.getElementById("svg-guage-circle").setAttribute("stroke-dasharray", current + " 999");
        if (current >= end) {
            clearInterval(timer);
        }
    }, stepTime);
}

// ------------- RESTART GAME -------------

function restartGame(){
  animationLoopId = requestAnimationFrame(runGameLoop);
  document.getElementById("end-screen").style.display = "none";
  // Reset values
  world.speed = 1;
  world.distanceTravelled = 0;
  world.autoScroll = true; 
  player.x = canvas.w(5);
  player.y = canvas.h(20);

  // Start Game Loop
  
}

// ------------- DETECT CLICKS & TAPS -------------

// Intercept taps on canvas
document.getElementById("main").addEventListener("touchmove", function(event){ 
  console.log('touchmove');
  event.preventDefault();
});

window.addEventListener("keydown", function(keyInfo){ player.keyPress(keyInfo);}, false);
window.addEventListener("touchstart", function(keyInfo){ player.keyPress(keyInfo);}, false);
window.addEventListener("mousedown", function(keyInfo){ player.keyPress(keyInfo);}, false);


function floor(x, height, width){
  this.x = x;
  this.width = width;
  this.height = height;
}

// ------------- RANDOM RANGE -------------

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomWithGap(min, max, gap, gapRadius){

  var rangeSize1 = (gap - gapRadius) - min;
  var rangeSize2 = max - (gap + gapRadius);
  var rawRandom = randomInteger(0, (rangeSize1 + rangeSize2) );

  if(rawRandom < rangeSize1){ 
    return min + rawRandom;
  } 
  else {
    return min + rawRandom + (gapRadius * 2);
  } 
}

// ------------- CONVERT CSS VARIABLES TO JS -------------

var colorPrimary = getCssVal('--color-primary');
var colorBg = getCssVal('--color-bg');

function getCssVal(property){
  let style = getComputedStyle(document.documentElement);
  let value = style.getPropertyValue(property);
  let cleanValue = value.replace(/\s+/g, '');
  return cleanValue
}

// ------------- GAME WORLD OBJECT -------------

var world ={
  height: canvas.height,
  width: canvas.width,
  gravity: canvas.h(1.5),
  highestFloor: canvas.h(60),
  speed: 1,
  distanceTravelled: 0,
  minWallChange: canvas.h(2),
  tilesPassed: 0,
  frameCount:0,
  autoScroll: true,
  floorTiles: [
    new floor(0, canvas.h(60), canvas.width)
  ],
  stop: function(){
    this.autoScroll = false;
    endGame();
  },
  start: function(){
    this.autoScroll = true;
  },
  moveFloor: function(){
    for (index in this.floorTiles){
      var tile = this.floorTiles[index];
      tile.x -= canvas.w(this.speed +0.5);
      this.distanceTravelled += this.speed / 3 /*tiles*/ / 100;
    }
  },
  addFutureTiles: function(){
    if(this.floorTiles.length >= 3){ 
      return;
    }
    var previousTile = this.floorTiles[this.floorTiles.length - 1];
    var biggestJumpableHeight = previousTile.height + (player.height * 3);
    
    if (biggestJumpableHeight > this.highestFloor){
      biggestJumpableHeight = this.highestFloor;
    }
    var randomHeight = randomWithGap(player.height, biggestJumpableHeight, previousTile.height, this.minWallChange);
    var leftValue = (previousTile.x + previousTile.width);

    var randomWidth = randomInteger(canvas.width * 0.7, canvas.width * 1.3);

    var next = new floor(leftValue, randomHeight, randomWidth);
    this.floorTiles.push(next);
  },
  speedUp: function(){
    var rate = 0.5; // +1 every sec
    this.frameCount++;
    if(this.frameCount % (60 * rate ) === 0)
    this.speed = this.speed + 0.01;
  },
  cleanOldTiles: function(){
    for(index in this.floorTiles){
      if(this.floorTiles[index].x <= -this.floorTiles[index].width){
        this.floorTiles.splice(index, 1);
        this.tilesPassed++;
      }
    }
  },
  getDistanceToFloor: function(playerX){
    for(index in this.floorTiles){
      var tile = this.floorTiles[index];
      if(tile.x <= playerX && tile.x + tile.width >= playerX){
        return tile.height;
      }
    }
    return -1;
  },
  tick: function(){
    if(!this.autoScroll
){
      return;
    }
    this.cleanOldTiles();
    this.addFutureTiles();
    this.moveFloor();
    this.speedUp();
  },
  draw: function(){
    this.updateText();
    ctx.fillStyle = colorBg;
    ctx.fillRect(0,0, this.width, this.height);
    for(index in this.floorTiles){
      var tile = this.floorTiles[index];
      var y = world.height - tile.height;
      ctx.fillStyle = colorPrimary;
      ctx.fillRect(tile.x, y, tile.width, tile.height);
    }
  },
  updateText: function(){
    var speedReading = Math.round(this.speed * 100);
    var distanceReading = Math.round(this.distanceTravelled) * 100;
    document.getElementById('speed').innerHTML = "Speed: " + speedReading;
  }
};


// ------------- PLAYER OBJECT -------------

var player = {
  x: canvas.w(5),
  y: canvas.h(20),
  height: canvas.h(4),
  width: canvas.h(4),
  invincible: false,
  downwardForce: world.gravity,
  jumpHeight: 0,
  getDistanceFor: function(x){
    var platformBelow = world.getDistanceToFloor(x);
    return world.height - this.y - platformBelow;
  },
  applyGravity: function(){
    this.currentDistanceAboveGround = this.getDistanceFor(this.x);
    var rightHandSideDistance = this.getDistanceFor(this.x + this.width);
    if(this.currentDistanceAboveGround < 0 || rightHandSideDistance < 0 ){
      if(player.invincible === false){
        world.stop();
      } 
    }
  },
  processGravity: function(){
    this.y += this.downwardForce;
    var floorHeight = world.getDistanceToFloor(this.x, this.width);
    var topYofPlatform = world.height - floorHeight;
    if(this.y > topYofPlatform) {
      this.y = topYofPlatform;
    }
    if(this.downwardForce < 0){
      this.jumpHeight += (this.downwardForce * -1);
      if(this.jumpHeight >= player.height * 6){
        this.downwardForce = world.gravity;
        this.jumpHeight = 0;
      }
    }
  },
  keyPress: function(keyInfo){
    var floorHeight = world.getDistanceToFloor(this.x, this.width);
    var onTheFloor = floorHeight == (world.height - this.y);
    if(onTheFloor){
      this.downwardForce = -world.gravity;
    }
    event.preventDefault();
  },
  tick: function(){
    this.processGravity();
    this.applyGravity();
  },
  draw: function(){
    ctx.fillStyle = colorPrimary;
    ctx.fillRect(player.x, player.y - player.height, this.height, this.width);
  }
}



