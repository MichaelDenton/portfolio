
//  Adjustable Variables 
var alexCount = 52;             // How many alex images are there?
var notCount = 66;              // How many not-alex images are there?
var firstRoundSpeed = 500;      // How long is the first round? (500 = 5 sec)
var decayRate = 0.9;            // Rate of time reduction per round (0.9 = 90%)
var penaltyRate = 0.8;          // Time reduction per mistake (0.8 = 80%)

//  Global Game Variables
var countDown = undefined;
var countDownSec = undefined;
var round = undefined;
var timeThisRound = undefined;
var mistakes = undefined;
var timer = undefined;
var gameActive = undefined;

//  Shorthand Variables
var characters = document.getElementsByClassName("character");

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

    // Reset game values
    countDown = firstRoundSpeed;
    mistakes = 0;
    round = 0;
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
            // Text when tapped
            this.getElementsByClassName("text")[0].innerHTML = "boom";
            // End the round
            endRound();
            // Start another round after 1 sec 
            setTimeout(startRound, 1000);
        }

        // If the player clicked NON-target
        else {
            this.classList.add("wrong");
            mistakes = mistakes + 1;
            // Apply penalty (80% of time)
            countDown = countDown * penaltyRate;
            this.getElementsByClassName("text")[0].innerHTML = "NO!";
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

            // Assign the shuffled Alex count to the tiles 
            characters[i].style.backgroundImage = "url('alex/alex" + alexCountShuffled[i] + ".jpg')";
        }

        // Set the random target
        var randomCharacter = Math.floor(Math.random() * characters.length );
        characters[randomCharacter].className = "character target";

        var randomNotAlex = Math.floor(Math.random() * notCount) + 1;
        characters[randomCharacter].style.backgroundImage = "url('not/not" + randomNotAlex + ".jpg')";

        // Set the timer going (every 10 milliseconds)
        timer = setInterval(runTimer, 10);
    }

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
        document.getElementById("end-screen").style.display = "flex";
        document.getElementById("end-score").innerHTML = round;
        document.getElementById("end-description").innerHTML = "You spotted " + round + " imposters. <br/> And made " + mistakes + " mistakes.";

        // Disable charaters
        for (var i = 0; i < characters.length; i++) {
            characters[i].classList.remove('hide', 'hidden', 'target', 'wrong', 'right');
            characters[i].getElementsByClassName("text")[0].innerHTML = "";
            characters[i].classList.add("hidden");
        }
    }

}
