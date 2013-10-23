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
/* gameSync
 *
 * sync the local game object to:
 *   the knockout model
 *   the firebase instance
 * */
function gameSync() {
    var gameData = currentGame.game.getData();
    gamesModel.game({gameId: currentGame.gameId, game: gameData});
    fire.child('games').child(currentGame.gameId).set(gameData);
}


function gameParse(data) {
    if (currentGame.game && currentGame.gameId === data.gameId) {
        currentGame.game.setData(data.game);
    } else {
        currentGame.gameId = data.gameId;
        currentGame.game = new Game(username, data.game);
        //try to join the game
        currentGame.game.addPlayer(username, username);
        gameSync();
    }
}

/* Game Managers */

//helper to parse a game into the model from a firebase data element
function parseFireGame(data) {
    gamesModel.game({gameId: data.name(), game: new Game(username,data.val()).getData()});
}

//joins a game (swaps listener and sets model game Id)
function joinGame(gameId) {
    //remove listener for any previous game
    if (gamesModel.game().gameId) {
        fire.child('games').child(gamesModel.game().gameId).off('value', parseFireGame);
    }
    //add listener for this game
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

function formatPlayer(data) {

    var player = _.find(data, function (ele) {
        return $(ele).hasClass('div_player');
    }), board;

    if (player) {
        board = $(player).find('.board');
    }

    if (board) {
        var front = $(board).find('.frontRow')
            , mid = $(board).find('.midRow')
            , back = $(board).find('.backRow')
            , unplayed = $(board).find('.unplayed');

        function populateCards(pair) {
            var row = pair[0], size = pair[1]
                , HTML = ''
                , rowData = row.text().split(','),
                cardCount = 0;

            rowData.forEach(function (card) {
                if (card.length === 2) {
                    cardCount++;
                    HTML += cardHTML(card);
                }
            });
            var buffer = size - cardCount;

            for (var i = 0; i < buffer; i++) {
                HTML += cardHTML();
            }
            row.html(HTML);
        }

        [
            [front, 3],
            [mid, 5],
            [back, 5],
            [unplayed, 5]
        ].forEach(populateCards);

    }
}

function cardHTML(card) {
    if (card) {
        return new playingCard(card).getHTML();
    } else {
        return '<div class="playingCard"></div>';
    }
}



