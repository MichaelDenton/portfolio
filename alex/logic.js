
//  Adjustable Variables 
var maxRounds = 6;
var penalty = -10;
var alexCount = 52;
var notCount = 66;

//  Game Variables
var round = 0;
var mistakes = 0;
var lapTime = 0;
var lapTimeSec = 0;
var totalTime = 0;
var totalTimeSec = 0;
var lapScore = 0;
var totalScore = 0;
var timer;
var gameActive = false;
var characters = document.getElementsByClassName("character");

function loadGame() {
    // Add 'on click' event to characters
    for (var i = 0; i < characters.length; i++) {
        characters[i].addEventListener("click", characterClicked);
    }

    // Load all the Alex tiles
    for (var i = 1; i < alexCount + 1; i++) {
    var img = document.createElement("img");
    img.src = "alex/alex"+i+".jpg";
    document.getElementById("all-tiles").appendChild(img);
    }

    // Load all the Not tiles
    for (var i = 1; i < notCount + 1; i++) {
    var img = document.createElement("img");
    img.src = "not/not"+i+".jpg";
    document.getElementById("all-tiles").appendChild(img);
    }
}

function startGame() {
    // Hide the start/end screen
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("end-screen").style.display = "none";
    // Reset game values
    round = 0;
    totalTime = 0;
    mistakes = 0;
    totalScore = 0;
    document.getElementById("total-score").innerHTML = totalScore;
    // Start a new round
    startRound();
}


function characterClicked() {
    // If game is active
    if (gameActive) {

        // If the player clicked the target 
        if (this.classList.contains("target")) {
            this.classList.add("right");
            // Show speed score
            this.getElementsByClassName("text")[0].innerHTML = "+" + lapScore;
            // Update total score
            totalScore = totalScore + lapScore;
            document.getElementById("total-score").innerHTML = totalScore;
            // End the round
            endRound();
            // Start another round after 1 sec 
            setTimeout(startRound, 1000);
        }

        // If the player clicked NON-target
        else {
            this.classList.add("wrong");
            mistakes = mistakes + 1;
            // Apply penalty
            totalScore = totalScore + penalty;
            document.getElementById("total-score").innerHTML = totalScore;
            this.getElementsByClassName("text")[0].innerHTML = penalty;
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
    // IF the current round is valid
    if (round < maxRounds) {

        //Set game to active
        gameActive = true;

        // Reset lap timer
        lapTime = 0;

        // Update what round it is
        round++;
        document.getElementById("round").innerHTML = round;

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

    // Game over
    else {

        //Show the end screen
        document.getElementById("end-screen").style.display = "flex";
        document.getElementById("end-score").innerHTML = totalScore;
        document.getElementById("end-description").innerHTML = "You completed " + maxRounds + " rounds in " + totalTimeSec + "  seconds with " + mistakes + " mistakes.";

        // Disable charaters
        for (var i = 0; i < characters.length; i++) {
            characters[i].classList.remove('hide', 'hidden', 'target', 'wrong', 'right');
            characters[i].getElementsByClassName("text")[0].innerHTML = "";
            characters[i].classList.add("hidden");
        }
    }
}

function runTimer() {
    // Update time
    lapTime++;
    totalTime++;
    totalTimeSec = (totalTime / 100).toFixed(2);
    document.getElementById("total-time-sec").innerHTML = totalTimeSec;

    // Caculate lap score
    var maxScore = 50;
    var baseline = 80;
    lapScore = Math.round((maxScore * baseline) / (lapTime + baseline));
}
