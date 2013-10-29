var server = 'http://localhost:3000';
var fire;

var gamesModel = {
    gameList: ko.observableArray(),
    game: ko.observable({})
};

var rules = {
    fantasyland: function (frontRow) {
        return frontRow.length === 3 && frontRow.reduce(function (a, b) {
            return (a.indexOf ? a.indexOf('q') : a) + b.indexOf('q');
        }) === -1;
    },
    game: {
        maxPlayers: 3,
        playerRules: {
            rows: {
                frontRow: 3,
                midRow: 5,
                backRow: 5
            }
        },
        maxTurns: 6,
        fantasyDraw: {
            cards: 14,
            discard: 1
        },
        firstDraw: {
            cards: 5,
            discard: 0
        },
        draw: {
            cards: 3,
            discard: 1
        },
        hide: {
            unplayed: true,
            turn: true,
            previous: false
        }
    }
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
        currentGame.game = new Game(username, rules, data.game);
        //try to join the game
        currentGame.game.addPlayer(username, username);
        gameSync();
    }
}

/* Game Managers */

//helper to parse a game into the model from a firebase data element
function parseFireGame(data) {
    gamesModel.game({gameId: data.name(), game: new Game(username, rules, data.val()).getData()});
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
    fire.child('games').push(new Game(username, rules, {name: name}).getData());
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
//if game is loaded
    if (currentGame.game && board) {
        var front = $(board).find('.frontRow')
            , mid = $(board).find('.midRow')
            , back = $(board).find('.backRow')
            , unplayed = $(board).find('.unplayed');

        function populateCards(pair) {

            var row = pair[0], size = pair[1]
                , rowData = row.text().split(','),
                cardCount = 0;

            row.empty();

            rowData.forEach(function (card) {
                if (card.length === 2) {
                    var cardEle = $(cardHTML(card));
                    cardEle.attr('data-card', card);
                    cardCount++;
                    //set to draggable if unplayed and your hand
                    if (row.hasClass('unplayed') && row.attr('data-username') === username) {
                        cardEle.prop('draggable', true);
                        cardEle.attr('ondragstart', 'dragCard(event)');
                        cardEle.addClass('playable');
                    }
                    row.append(cardEle);
                }
            });
            var buffer = size - cardCount;

            for (var i = 0; i < buffer; i++) {
                var cardEle = $(cardHTML());
                cardEle.attr('ondrop', 'dropCard(event)');
                cardEle.attr('ondragover', 'dragOver(event)');
                cardEle.attr('ondragleave', 'dragLeave(event)');
                cardEle.attr('data-card', 'empty');
                row.append(cardEle);
            }
        }

        [
            [front, currentGame.game.rules.game.playerRules.rows.frontRow],
            [mid, currentGame.game.rules.game.playerRules.rows.midRow],
            [back, currentGame.game.rules.game.playerRules.rows.backRow],
            [unplayed, 0]
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

function dropCard(ev) {
    var $row = $(ev.target).parent()
        , rowNum, row
        , card = ev.dataTransfer.getData("card");

    if ($row.hasClass('frontRow')) {
        row = 'frontRow';
        rowNum = 2;
    } else if ($row.hasClass('midRow')) {
        row = 'frontRow';
        rowNum = 1;
    } else {
        row = 'frontRow';
        rowNum = 0;
    }

    /* Play the card */
    var player = currentGame.game.getPlayer(username);
    player.playCard(rowNum, card);
    var discards = player.turnNumber > 1 ? 1 : 0;

    /* End the turn if all cards played */
    if (player.unplayed.length === discards) {
        currentGame.game.endTurn();
    }
    /* sync the game */
    gameSync();

}
function dragOver(ev) {
    $(ev.target).parent().addClass('dragover');
    $(ev.target).parent().children().addClass('dragover');
    ev.preventDefault();
}
function dragLeave(ev) {
    $(ev.target).parent().removeClass('dragover');
    $(ev.target).parent().children().removeClass('dragover');

    ev.preventDefault();
}

function dragCard(ev) {
    ev.dataTransfer.setData("card", ev.target.getAttribute('data-card'));
}

function startGame() {
    currentGame.game.startGame();
    currentGame.game.deal();
    gameSync();
}

