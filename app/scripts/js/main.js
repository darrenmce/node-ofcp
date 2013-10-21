var server = 'http://localhost:3000';
var fire;

var gamesModel = {
    gameList: ko.observableArray(),
    game: ko.observable({}),
    gameId: ko.observable()
};

/* Current Game */
var currentGame = {};

$(function () {

    //get Auth token
    $.getJSON(server + '/getFireBase', function (resp) {
        if (resp.root && resp.token) {
            fire = new Firebase(resp.root);
            fire.auth(resp.token, function (err) {
                if (err) {
                    //handle auth failure
                    console.log('Authentication with Firebase failed');
                } else {
                    //start the app!
                    startApp(fire);
                }
            });
        } else {
            //handle node failure
            console.log('getFireBase node response failure');
        }
    });

    //apply knockout bindings
    ko.applyBindings(gamesModel);

    gamesModel.game.subscribe(gameParse);


    /* attach on-ready handlers */

    // Create Game Button
    $('#btn_createGame').on('click', function (ev) {
        ev.preventDefault();
        var gameInput = $('#txt_createGame');
        createGame(gameInput.val());
        gameInput.val('');
    });

    $('#btn_test').on('click', function (ev) {
        ev.preventDefault();
        var data = $('#test').val();

        currentGame.game.addPlayer(data);
    });

    $('#btn_test2').on('click', function (ev) {
        ev.preventDefault();
        gameSync();
    });

    //

});
/* start the App with a firebase connection */
function startApp() {
    var games = fire.child('games');
    games.on('value', updateGameList);
}

function updateGameList(data) {
    //update gameList
    gamesModel.gameList(
        _.map(data.val(), function (data, key) {
            return {gameId: key, name: data.name || 'untitled'};
        }));
}

function gameSync() {
    var gameData = currentGame.game.getData();
    gamesModel.game({gameId: currentGame.gameId, game: gameData});
    fire.child('games').child(currentGame.gameId).set(gameData);
}


function gameParse(data) {
    if (currentGame.game) {
        console.log(data.game);
        currentGame.game.setData(data.game);
    } else {
        currentGame.game = new Game(data.game);
    }
}

/* Game Managers */

//helper to parse a game into the model from a firebase data element
function parseFireGame(data) {
    gamesModel.game({gameId: currentGame.gameId, game: data.val()});
}

//joins a game (swaps listener and sets model game Id)
function joinGame(gameId) {
    currentGame.gameId = gameId;

    if (gamesModel.game().gameId) {
        fire.child('games').child(gamesModel.game().gameId).off('value', parseFireGame);
    }
    fire.child('games').child(gameId).on('value', parseFireGame);
}

//creates a new game
function createGame(name) {
    currentGame.game = new Game({name: name});
    currentGame.gameId = fire.child('games').push(currentGame.game.getData()).name();
}


function formatButtons(data) {
    $(data[1]).find('button').on('click', function (ev) {
        ev.preventDefault();
        joinGame(this.getAttribute('data-gameId'));
    });
}




