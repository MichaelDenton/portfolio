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