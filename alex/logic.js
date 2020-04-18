
//  Adjustable Variables 
var alexCount = 52;             // How many alex images are there?
var notCount = 66;              // How many not-alex images are there?
var firstRoundSpeed = 500;      // How long is the first round? (500 = 5 sec)
var decayRate = 0.9;            // Rate of time reduction per round (0.9 = 90%)
var penaltyRate = 0.8;          // Time reduction per mistake (0.8 = 80%)

var winEmoji = ["👏","👍","🤘","💪","🙌","💥"]
var winWords = ["Nice","Yeah boy", "Got Em", "Damn straight", "Boom", "Ka-pow", "Fake Alex Alert!", "Bloody imposter",  "Begone fraud", "That's no Alex", "You're not Alex", "Fraud" , "Charlatan!", "Phony", "Con-Alex"]

var failEmoji = ["⛔️","🚫","😵","😡","🤬","💩","👎","🙈"]
var failWords = ["Fuck sticks", "Bugger","Shit","Crap balls","Fail","Try Again","Nah","Nope", "Try harder"]

//  Global Game Variables
var countDown = undefined;
var countDownSec = undefined;
var timeThisRound = undefined;
var timer = undefined;
var gameActive = undefined;

var mistakes = 0;
var round = 0;

var imagesHitWin = [];
var imagesHitFail = [];

//  Shorthand Variables
var characters = document.getElementsByClassName("character");
var notAlexCountShuffled =[]

function loadGame() {
    // Preload Alex tiles on the start screen
    for (var i = 1; i < alexCount + 1; i++) {
    var img = document.createElement("img");
    img.src = "alex/alex"+i+".jpg";
    document.getElementById("preload-images").appendChild(img);
    }

    // Preload Not-Alex tiles on the start screen
    for (var i = 1; i < notCount + 1; i++) {
    var img = document.createElement("img");
    img.src = "not/not"+i+".jpg";
    document.getElementById("preload-images").appendChild(img);
    }

    // Add 'click' event to the character tiles
    for (var i = 0; i < characters.length; i++) {
        characters[i].addEventListener("click", characterClicked);
    }
}

function startGame() {

    // Hide the Start and End screens
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("end-screen").style.display = "none";

    // Shuffle the target count (so the same target won't appear twice in a game)
    while( notAlexCountShuffled.length < notCount ){
        let rnd = Math.floor(Math.random()* notCount) + 1;
        if(!notAlexCountShuffled.includes(rnd)){
            notAlexCountShuffled.push(rnd);
        }
    }

    countDown = firstRoundSpeed;
    document.getElementById("round").innerHTML = round;

    // Start a new round
    startRound();
}

function characterClicked() {
    // If game is active
    if (gameActive) {

        // If the player clicked the target 
        if (this.classList.contains("target")) {
            this.classList.add("right");
            // Update what round it is
            round++;
            document.getElementById("round").innerHTML = round;

            // Record what image they hit (just the URL)
             imagesHitWin.push(this.style.backgroundImage.slice(4, -1).replace(/"/g, ""));

            // WIN text when tapped
            this.getElementsByClassName("emoji")[0].innerHTML = winEmoji[Math.floor(Math.random() * winEmoji.length)];
            this.getElementsByClassName("text")[0].innerHTML = winWords[Math.floor(Math.random() * winWords.length)];
            // End the round
            endRound();
            // Start another round after 1 sec 
            setTimeout(startRound, 1000);
        }

        // If the player clicked NON-target
        else {
            this.classList.add("wrong");
            mistakes = mistakes + 1;

            // Record what image they hit
             imagesHitFail.push(this.style.backgroundImage.slice(4, -1).replace(/"/g, ""));

            // Apply penalty (80% of time)
            countDown = countDown * penaltyRate;
            // FAIL text when tapped
            this.getElementsByClassName("emoji")[0].innerHTML = failEmoji[Math.floor(Math.random() * failEmoji.length)];
            this.getElementsByClassName("text")[0].innerHTML = failWords[Math.floor(Math.random() * failWords.length)];
        }
    }
}

function endRound() {
    clearInterval(timer);
    gameActive = false;
    for (var i = 0; i < characters.length; i++) {
        characters[i].classList.add("hide");
    }
}


function startRound() {
    // Check the countdown clock
    if (countDown > 0) {

        //Set game to active
        gameActive = true;

        //Reset countdown clock
        var decayRateThisRound = Math.pow(decayRate, round);
        timeThisRound = firstRoundSpeed * decayRateThisRound;
        countDown = timeThisRound;

        // Shuffle the Alex Count
        let alexCountShuffled =[]
        while( alexCountShuffled.length < characters.length ){
            let rnd = Math.floor(Math.random()* alexCount) + 1;
            if(!alexCountShuffled.includes(rnd)){
                alexCountShuffled.push(rnd);
            }
        }

        //Reset characters
        for (var i = 0; i < characters.length; i++) {
            characters[i].classList.remove('hide', 'hidden', 'target', 'wrong', 'right');
            characters[i].getElementsByClassName("text")[0].innerHTML = "";
            characters[i].getElementsByClassName("emoji")[0].innerHTML = "";

            // Assign the shuffled Alex count to the tiles 
            characters[i].style.backgroundImage = "url('alex/alex" + alexCountShuffled[i] + ".jpg')";
        }

        // Set the random target (Not Alex)
        var randomCharacter = Math.floor(Math.random() * characters.length );
        characters[randomCharacter].className = "character target";

        var randomNotAlex = Math.floor(Math.random() * notCount) + 1;
        characters[randomCharacter].style.backgroundImage = "url('not/not" + notAlexCountShuffled[round] + ".jpg')";


        // Set the timer going (every 10 milliseconds)
        timer = setInterval(runTimer, 10);
    }

}

// Get random number
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

function runTimer() {
    // Update time
    countDown--;
    countDownSec = (countDown / 100).toFixed(2);
    document.getElementById("time-remaining").innerHTML = countDownSec;

    // Update the countdown bar
    var percentOfRound = (100-((countDown / timeThisRound) * 100)).toFixed(0);
    document.getElementById("progress-bar").style.width =  percentOfRound + "%";

    // Check the countdown clock
    if (countDown > 0) {
        gameActive = true;
    }
    else{
        console.log("Time's up!");
        alert("Time's up!");

        // Stop Timer
        endRound();

        //Show the end screen
        document.getElementById("end-screen").style.display = "table";

        // Display number of fakes found
        document.getElementById("endtext2").innerHTML = round;


        // Load the winning images
        for (var i = 0; i < imagesHitWin.length; i++) {
            var y = document.createElement('img');
            y.src = imagesHitWin[i];
            // Set width based on the number of images | Image width: 100% / RoundUp:(numberOfImages / Rows)
            y.style.maxWidth = (100 / Math.ceil(imagesHitWin.length / 2)) +'%';

            // Randomly rotate image
            y.style.transform = "rotate(" + getRndInteger(-10, 10) + "deg)";
            document.getElementById("win-images").appendChild(y);
        }

        // Let them know if they made any mistakes
        if (mistakes > 0) {
            document.getElementById("endtext4").innerHTML = "* but you did screw up " + mistakes;

            // Load the fail images
            for (var i = 0; i < imagesHitFail.length; i++) {
            var y = document.createElement('img');
            y.src = imagesHitFail[i];
            // Set width based on the number of images | Image width: 100% / RoundUp:(numberOfImages / Rows)
            y.style.maxWidth = (100 / Math.ceil(imagesHitFail.length / 2)) +'%';

            // Randomly rotate image
            y.style.transform = "rotate(" + getRndInteger(-10, 10) + "deg)";
            document.getElementById("fail-images").appendChild(y);
        } 

        }
        else{
            if (round > 5) {
            //No mistakes "Click here to claim your prize"
            var a = document.createElement('a');
            var linkText = document.createTextNode("Click here to claim your prize");
            a.appendChild(linkText);
            a.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
            document.getElementById("endtext4").appendChild(a);
            }
        }

        // Disable charaters
        for (var i = 0; i < characters.length; i++) {
            characters[i].classList.remove('hide', 'hidden', 'target', 'wrong', 'right');
            characters[i].getElementsByClassName("text")[0].innerHTML = "";
            characters[i].classList.add("hidden");
        }
    }

}
