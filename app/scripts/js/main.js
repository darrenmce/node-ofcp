var server = 'http://localhost:3000';
var fire;

var gamesModel = {
    gameList: ko.observableArray(),
    game: ko.observable({})
};

/* Current Game */
var currentGame = {};

/* My username */
var username;

$(function () {

    //get Auth token
    $.getJSON(server + '/getFireBase', function (resp) {
        if (resp.username && resp.root && resp.token) {
            fire = new Firebase(resp.root);
            fire.auth(resp.token, function (err) {
                if (err) {
                    //handle auth failure
                    console.error('Authentication with Firebase failed');
                } else {
                    //start the app!
                    username = resp.username;
                    startApp();
                }
            });
        } else {
            //handle node failure
            console.error('getFireBase node response failure');
        }
    });

});

/* start the App with a firebase connection */
function startApp() {
    var games = fire.child('games');
    games.on('value', updateGameList);

    //apply knockout bindings
    ko.applyBindings(gamesModel);

    //subscribe to the local model, update local game
    gamesModel.game.subscribe(gameParse);

    /* attach on-ready handlers */

    // Create Game Button
    $('#btn_createGame').on('click', function (ev) {
        ev.preventDefault();
        var gameInput = $('#txt_createGame');
        createGame(gameInput.val());
        gameInput.val('');
    });

    $('#btn_logout').text('Logout [ ' + username + ' ]').on('click', function (ev) {
        ev.preventDefault();
        $.getJSON(server + '/logout', function (resp) {
            if (resp.logout) {
                location.reload(true);
            } else {
                console.error('Logout Failed: ' + resp);
            }
        });
    });
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
        currentGame.game.setData(data.game);
    } else {
        currentGame.game = new Game(username, data.game);
        //join the game when locally instantiating
        currentGame.game.addPlayer(username, username);
        gameSync();

        //attach the game div
       // $('#div_players').html('<ul data-bind="foreach: game.game.players"><li><span data-bind="text: playerId"></span></li></ul>');
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
    fire.child('games').push(new Game(username, {name: name}).getData());
}


function formatButtons(data) {
    $(data[1]).find('button').on('click', function (ev) {
        ev.preventDefault();
        joinGame(this.getAttribute('data-gameId'));
    });
}




