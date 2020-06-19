



// ------------- START GAME -------------

function startGame(){
  window.gameIntervalId = setInterval(runGame, 1000 / 60);
  document.getElementById("start-screen").style.display = "none";
}

// ------------- END GAME -------------

function endGame(){
  clearInterval(gameIntervalId);
  document.getElementById("end-screen").style.display = "block";
  var speedReading = Math.round(world.speed * 100);
  document.getElementById("end-description").innerHTML = "Top speed: " + speedReading;
}

// ------------- RESTART GAME -------------

function restartGame(){

  document.getElementById("end-screen").style.display = "none";
  // Reset values
  world.speed = 1;
  world.distanceTravelled = 0;
  world.autoScroll = true; 
  player.x = canvas.w(5);
  player.y = canvas.h(20);

  // Start Game
  window.gameIntervalId = setInterval(runGame, 1000 / 60);
}

// ------------- CANVAS SIZE -------------

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.dpr = window.devicePixelRatio || 1;
canvas.height = Math.min(window.screen.width, window.screen.height) * canvas.dpr;
canvas.width = Math.max(window.screen.width, window.screen.height) * canvas.dpr;

canvas.h = function(percent){return percent* (canvas.height * 0.01)}
canvas.w = function(percent){return percent* (canvas.width * 0.01)}


// ------------- SCALE OVERLAY SCREENS -------------

scaleOverlay();

window.addEventListener("resize", scaleOverlay);

function scaleOverlay(){

  var scale = Math.min( 
    canvas.getBoundingClientRect().width / 667, 
    canvas.getBoundingClientRect().height / 375 
  );

  var startScreen = document.getElementById("start-screen");
  var endScreen = document.getElementById("end-screen");

  if(startScreen){
    startScreen.style.transform = 'scale(' + scale + ')';
  } else {console.log('no start screen')}

  if(endScreen){
    endScreen.style.transform = 'scale(' + scale + ')';
  }

  var scaleToFullscreen = Math.min( 
    canvas.getBoundingClientRect().width / Math.max(window.screen.width, window.screen.height), 
    canvas.getBoundingClientRect().height / Math.min(window.screen.width, window.screen.height) 
  );

  var testWrapper = document.getElementById("main-wrapper");
  testWrapper.style.height = Math.min(window.screen.width, window.screen.height)+"px";
  testWrapper.style.width = Math.max(window.screen.width, window.screen.height)+"px";
  testWrapper.style.transform = 'scale(' + scaleToFullscreen + ')';
  testWrapper.style.marginLeft = -(Math.max(window.screen.width, window.screen.height)/2)+"px";
  testWrapper.style.marginTop =  -(Math.min(window.screen.width, window.screen.height)/2)+"px";

}

// ------------- HIDE INACTIVE CURSOR -------------  

document.addEventListener("mousemove", resetTimer);

var timerHandle;

function resetTimer() {
    // Show cursor
    document.body.style.cursor = "";
    // Show controls
    document.getElementById('btn-fullscreen').style.visibility = "visible";
    window.clearTimeout(timerHandle);
    timerHandle = setTimeout(function(){ 
      // Hide cursor
      document.body.style.cursor = "none"; 
      // Hide controls
    //  document.getElementById('btn-fullscreen').style.visibility = "hidden";

    },1000); // Millisecond delay
}

// ------------- FULLSCREEN ------------- 
// Note: Fullscreen is not supported by ios for iphone 
// And most browsers currently require vendor prefixes

var fsElement = document.getElementById('main');
var fsBtn = document.getElementById('btn-fullscreen');

// Is fullscreen supported? 
if( fsElement.requestFullscreen       || 
    fsElement.mozRequestFullScreen    || 
    fsElement.webkitRequestFullscreen || 
    fsElement.msRequestFullscreen     ){
    // Supported
  } else {
    // Not supported
    fsBtn.remove();
  }


function toggleFullscreen(){
  // Toggle to fullscreen
  if(fsElement.dataset.state === 'minimised'){
    if      (fsElement.requestFullscreen)       { fsElement.requestFullscreen() } 
    else if (fsElement.mozRequestFullScreen)    { fsElement.mozRequestFullScreen() }
    else if (fsElement.webkitRequestFullscreen) { fsElement.webkitRequestFullscreen() }
    else if (fsElement.msRequestFullscreen)     { fsElement.msRequestFullscreen() }
  } 
  // Toggle to minimised
  else if(fsElement.dataset.state === 'fullscreen'){ 
    if      (document.exitFullscreen)       {document.exitFullscreen() } 
    else if (document.mozCancelFullScreen)  {document.mozCancelFullScreen() }
    else if (document.webkitExitFullscreen) {document.webkitExitFullscreen() } 
    else if (document.msExitFullscreen)     {document.msExitFullscreen()}
  }
  fsBtn.blur();
}

fullscreenChanged();

// Listen for any changes to fullscreen 
document.addEventListener('fullscreenchange', fullscreenChanged);
document.addEventListener('mozfullscreenchange', fullscreenChanged);
document.addEventListener('webkitfullscreenchange', fullscreenChanged);
document.addEventListener('msfullscreenchange', fullscreenChanged);

function fullscreenChanged(){
  if (  document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
  ){
    // Now fullscreen
    fsElement.dataset.state = 'fullscreen';
    fsBtn.getElementsByTagName("svg")[0].innerHTML = `<use href="#shrink-icon"/>`;
    console.log('fullscreen');
  } 
  else {
    // Now minimised
    fsElement.dataset.state = 'minimised';
    fsBtn.getElementsByTagName("svg")[0].innerHTML = `<use href="#fullscreen-icon"/>`;
  }
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


// ------------- COLOURS (From CSS) -------------

function getCssVal(property){
  let style = getComputedStyle(document.documentElement);
  let value = style.getPropertyValue(property);
  let cleanValue = value.replace(/\s+/g, '');
  return cleanValue
}

var colorPrimary = getCssVal('--color-primary');
var colorBg = getCssVal('--color-bg');

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


// ------------- Main loop -------------

var runGame = function() {
  player.tick();
  world.tick();
  world.draw();
  player.draw();
};
