var server = 'http://localhost:3000';
var fire;

var gamesModel = {
    gameList: ko.observableArray(),
    game: ko.observable({})
};

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

    /* attach on-ready handlers */

    // Create Game Button
    $('#btn_createGame').on('click', function (ev) {
        ev.preventDefault();
        var gameInput = $('#txt_createGame');
        var players=[];
        $('.playerInput').each(function() {
            if ($(this).val().trim().length !== 0) {
                players.push($(this).val());
            }
        });
        createGame(gameInput.val(),players);
        gameInput.val('');
        $('.playerInput').val('');
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

/* Game Managers */

//helper to parse a game into the model from a firebase data element
function parseGame(data) {
    gamesModel.game().game = data.val();
}

//joins a game (swaps listener and sets model game Id)
function joinGame(gameId) {
    if (gamesModel.game().gameId) {
        fire.child('games').child(gamesModel.game().gameId).off('value', parseGame);
    }
    gamesModel.game({
        gameId: gameId
    });
    fire.child('games').child(gameId).on('value', parseGame);
}

//creates a new game
function createGame(name,players) {
    var game = newGame(name,players);
    var gameId = fire.child('games').push(game).path.m[1];
    console.log('Added: ' + gameId);
}

//helper for creating a new game
function newGame(name, players) {
    var playersArray = players || [];
    if (playersArray.length > 4) {
        console.warn('cannot create a game with more than 4 players, you idiot.');
        return false;
    } else {
        return {
            name: name,
            deck: new Deck(),
            players: playersArray.map(function (name) {
                return new Player(name);
            })
        };
    }
}


function formatButtons(data) {
    $(data[1]).find('button').on('click', function (ev) {
        ev.preventDefault();
        joinGame(this.getAttribute('data-gameId'));
    });
}

var Deck = function () {
    this.cards = [
        "2c", "2d", "2h", "2s",
        "3c", "3d", "3h", "3s",
        "4c", "4d", "4h", "4s",
        "5c", "5d", "5h", "5s",
        "6c", "6d", "6h", "6s",
        "7c", "7d", "7h", "7s",
        "8c", "8d", "8h", "8s",
        "9c", "9d", "9h", "9s",
        "tc", "td", "th", "ts",
        "jc", "jd", "jh", "js",
        "qc", "qd", "qh", "qs",
        "kc", "kd", "kh", "ks",
        "ac", "ad", "ah", "as"
    ];
}

Deck.prototype = {
    /* draw numCards random cards from the deck
     *  returns array */
    draw: function (numCards) {
        var self = this;
        var num = numCards || 1;
        if (self.cards.length >= num) {
            var draw = [];
            for (var i = 0; i < num; i++) {
                var pos = _.random(0, self.cards.length - 1);
                var card = self.cards.splice(pos, 1)[0];
                draw.push(card);
            }
            return draw;
        } else {
            return false;
        }

    },
    //useless, but for the superstitious
    shuffle: function () {
        this.cards = _.shuffle(this.cards);
    }
};

function Player(name) {
    this.name = name;
    this.backRow = [];
    this.midRow = [];
    this.frontRow = [];
    this.unplayed = [];
}
Player.prototype = {
    /* plays the card to a row
     * row: 0 = back, 1 = mid, 2 = front
     *
     * returns boolean based on success
     * */
    playCard: function (row, card) {
        var self = this;
        var rowArray = row === 0 ? self.backRow : (row === 1 ? self.midRow : self.frontRow);
        var maxSize = row === 2 ? 3 : 5;
        if (rowArray.length < maxSize) {
            rowArray.push(card);
            return true;
        } else {
            return false;
        }
    },
    drawCard: function (num) {
    }
}

