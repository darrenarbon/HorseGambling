app.controller('HorseController', function($scope, $timeout, $q, GiveMeHorse) {

    //set up all the variables for the race
    $scope.numberOfHorses = 4 //default value of horses
    $scope.whichHorse = ""
    var horsesFinished = 0
    var colourArray = []
    $scope.howMuch = 0
    //start money is 100
    $scope.winnings = 100;

    $scope.betOnHorse = function(id) {
        resetHorses(true)
        var clickedHorse = $scope.horses.filter(obj => obj.id === id)
        clickedHorse[0].horseMainClass= "selectedHorse"
        $scope.whichHorse = id;
    }

    $scope.incBet = function(amount) {
        if (amount ===0) {
            $scope.howMuch = 0
        } else {
            $scope.howMuch += amount
        }
    }

    //function to create all the horse objects. Run at the start of the game and every horse count change
    $scope.initGame = function() {
        //reset finished horses
        horsesFinished = 0
        //reset selected horse
        $scope.whichHorse = ""
        //clear the messages array
        colourArray = []
        for (var i = 1; i <= $scope.numberOfHorses; i++) {
            //create a horse object for each horse
            var pos = (i === $scope.numberOfHorses) ? "Last" : i
            var text = (i === 1) ? "Winner!!" : "Pos: " + i
            var text = (i === $scope.numberOfHorses) ? "Loser :(" : text
            var colour = {
                class: "button" + pos,
                text: text,
            }
            //push the horse object to the horses array
            colourArray.push(colour)
        }

        //clear the horses array
        $scope.horses = []
        //loop through the number of horses that are needed
        for (var i = 1; i <= $scope.numberOfHorses; i++) {
            //create a horse object for each horse
            var oddsRand = (Math.floor(Math.random() * $scope.numberOfHorses) + 1)
            var horse = {
                horseMainClass: "indivHorse",
                horseClass: "buttonOff",
                imageURL: "images/horse" + (Math.floor(Math.random() * 4) + 1) + "_full.png",
                horseText: "Horse " + i,
                horseName: "Horse " + i,
                id: "horse_" + i,
                horseOdds: oddsRand
            }
            //push the horse object to the horses array
            $scope.horses.push(horse)
        }
    }

    //start the game on load.
    $scope.initGame()

    //function to give only the winning horse
    $scope.startRaceTimers = function() {
        if (checkBetsArePlaced()) {
            //reset the horses
            resetHorses()
            horsesFinished = 0

            // start the race
            setAllHorseText('Racing..')
            $scope.bettingMessages = "Racing is underway"

            //use the horse_racing service to return the horse promises
            var horsePromises = [];
            for (var i = 1; i <= $scope.numberOfHorses; i++) {
                //create a promise for each horse
                var promise = GiveMeHorse.please('horse_' + i)
                //push the promise to the promises array
                horsePromises.push(promise)
            }

            //start the race with Promise.race. Will complete when the first promise is returned
            $q.race(horsePromises).then(function (value) {
                //call function to colour the winning cell
                timesUp(value, false)
                //call function to calculate winnings
                checkWinner(value, true)
            })
        }
    }

    $scope.startTimers = function() {
        if (checkBetsArePlaced()) {
            //reset buttons and array of classes
            resetHorses()
            horsesFinished = 0

            // start the race
            setAllHorseText('Racing..')
            $scope.bettingMessages = "Racing is underway"

            //start timers by using the horse_racing service which returns promises, then fire the timesUp function to colour the horse
            for (var i = 1; i <= $scope.numberOfHorses; i++) {
                //create a promise for each horse
                var promise = GiveMeHorse.please('horse_' + i, $scope.horses[i-1].horseOdds).then(function (id) {
                    timesUp(id, true)
                    checkWinner(id, false)
                });
            }
        }
    }

    function timesUp(id, multi) {
        //go through each case and colour accordingly, using the first value from the colours array
        var finishedHorse = $scope.horses.filter(obj => obj.id === id)
        finishedHorse[0].horseClass = colourArray[horsesFinished].class
        finishedHorse[0].horseText = colourArray[horsesFinished].text

        horsesFinished ++
    }

    //function to calculate winnings.
    function checkWinner(horse_id, singleHorse) {
        var finishedHorse = $scope.horses.filter(obj => obj.id === horse_id)
        if (!singleHorse && finishedHorse[0].id === $scope.whichHorse) {
            //the horse you bet on has finished. Calculate the winnings.
            if (horsesFinished <= 3){
                var multiplier = 1/horsesFinished
                var winnings = Math.floor($scope.howMuch * (finishedHorse[0].horseOdds * multiplier))
                $scope.winnings += winnings
                $scope.bettingMessages = "You won: £" + winnings
            } else {
                $scope.winnings -= $scope.howMuch
                $scope.bettingMessages = "You lost :("
            }
        } else if (singleHorse) {
            if (horse_id === $scope.whichHorse) {
                $scope.winnings += ($scope.howMuch * $scope.numberOfHorses)
                $scope.bettingMessages = "You won: £" + $scope.howMuch * ($scope.numberOfHorses * 3)
            } else {
                $scope.winnings -= $scope.howMuch
                $scope.bettingMessages = "You lost :("
            }
        }
    }

    //rest all the horses to white.
    function resetHorses(sel = false) {
        $scope.horses.forEach(function(horse) {
            horse.horseClass = "buttonOff"
            horse.horseText = horse.horseName
            if (sel) horse.horseMainClass = "indivHorse"
        })
    }

    //function to write all messages in one go.
    function setAllHorseText(textVal){
        $scope.horses.forEach(function(horse) {
            horse.horseText = textVal
        })
    }

    function checkBetsArePlaced(){
        var horseNotChosen = ($scope.whichHorse === "" || $scope.whichHorse === undefined) ? true : false
        var moneyNotPlaced = ($scope.howMuch === "" | $scope.howMuch === 0 || $scope.howMuch === undefined) ? true : false
        if (horseNotChosen && moneyNotPlaced){
            $scope.bettingMessages = "You need to choose a horse and place a bet"
            return false
        } else if (horseNotChosen) {
            $scope.bettingMessages = "You need to choose a horse to bet on"
            return false
        } else if (moneyNotPlaced) {
            $scope.bettingMessages = "You need to place a bet"
            return false
        } else if ($scope.howMuch < 0) {
            $scope.bettingMessages = "You need to bet actual money"
            return false
        } else {
            return true
        }
    }

});