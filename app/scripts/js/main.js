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
    },
    scoring: {
        scoop: 3,
        backRow: 1,
        midRow: 1,
        frontRow: 1,
        bonus: {
            "fault" : {
                handType: 0 ,
                back: 0,
                mid: 0,
                front: 0
            },
            "high card": {
                handType: 1,
                back: 0,
                mid: 0,
                front: 0
            },
            "one pair": {
                handType: 2,
                back: 0,
                mid: 0,
                front: {
                    "a": 9, // Aces
                    "k": 8, // Kings
                    "q": 7, // Queens
                    "j": 6, // Jacks
                    "t": 5, // Tens
                    "9": 4, // Nines
                    "8": 3, // Eights
                    "7": 2, // Sevens
                    "6": 1, // Sixes
                    "5": 0, // Fives
                    "4": 0, // Fours
                    "3": 0, // Threes
                    "2": 0  // Twos
                }
            },
            "two pairs": {
                handType: 3,
                back: 0,
                mid: 0,
                front: 0
            },
            "three of a kind": {
                handType: 4,
                back: 0,
                mid: 2,
                front: {
                    "a": 22, // Aces
                    "k": 21, // Kings
                    "q": 20, // Queens
                    "j": 19, // Jacks
                    "t": 18, // Tens
                    "9": 17, // Nines
                    "8": 16, // Eights
                    "7": 15, // Sevens
                    "6": 14, // Sixes
                    "5": 13, // Fives
                    "4": 12, // Fours
                    "3": 11, // Threes
                    "2": 10  // Twos
                }
            },
            "straight": {
                handType: 5,
                back: 2,
                mid: 4,
                front: 0
            },
            "flush": {
                handType: 6,
                back: 4,
                mid: 8,
                front: 0
            },
            "full house": {
                handType: 7,
                back: 4,
                mid: 8,
                front: 0
            },
            "four of a kind": {
                handType:8,
                back: 4,
                mid: 8,
                front: 0
            },
            "straight flush": {
                handType: 9,
                back: 15,
                mid: 30,
                front: 0
            },
            "royal flush": {
                handType: 10,
                back: 25,
                mid: 50,
                front: 0
            }
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

        var populateCards = function (pair) {

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
        };

        Array.prototype.forEach.call([
            [front, currentGame.game.rules.game.playerRules.rows.frontRow],
            [mid, currentGame.game.rules.game.playerRules.rows.midRow],
            [back, currentGame.game.rules.game.playerRules.rows.backRow],
            [unplayed, 0]
        ], populateCards);

    }
}

function cardHTML(card) {
    if (card) {
        return new PlayingCard(card).getHTML();
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

