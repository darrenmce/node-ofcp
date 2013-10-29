var Game = function (username, rules, options) {
    var opt = options ? options : {};
    this.username = username;
    this.rules = rules;
    this.setData(opt);
}

Game.prototype = {
    startGame: function (first) {
        var self = this;
        if (!self.gameStatus.started) {
            var self = this;
            self.resetGame();
            var turn = first || _.random(0, self.players.length - 1);
            self.gameStatus.turn = self.players[turn].playerId;
            self.gameStatus.started = true;
        }
    },
    deal: function () {
        var self = this;
        /* game rules */
        var gr = self.rules.game;

        if (self.gameStatus.dealtTurn) {
            console.warn('Already dealt this turn.');
            return false;
        } else {
            var currPlayer = self.getPlayer(self.gameStatus.turn)
                , turnNumber = currPlayer.turnNumber;
            if (turnNumber < gr.maxTurns) {
                if (currPlayer.fantasyland) {
                    /* Fantasyland Draw */
                    currPlayer.dealTo(self.deck.draw(gr.fantasyDraw.cards));
                    currPlayer.turnNumber = gr.maxTurns - 1;
                } else if (turnNumber === 1) {
                    /* Inital Draw */
                    currPlayer.dealTo(self.deck.draw(gr.firstDraw.cards));
                    self.gameStatus.dealtTurn = true;
                    return true;
                } else if (turnNumber < gr.maxTurns) {
                    /* Regular Draw */
                    currPlayer.dealTo(self.deck.draw(gr.draw.cards));
                    self.gameStatus.dealtTurn = true;
                    return true;
                }
            } else {
                /* Game is Over! */
                console.warn('Game Over!');
                /* Flip game 'started' back to false */
                self.gameStatus.started = 0;
                return false;
            }
        }

    },
    //get the current turn player obj
    getPlayer: function (playerId) {
        var self = this;
        return $.grep(self.players, function (player) {
            return player.playerId === playerId;
        })[0];
    },
    endTurn: function () {
        var self = this;
        /* game rules */
        var gr = self.rules.game;
        if (self.username === self.gameStatus.turn) {
            var currPlayer = self.getPlayer(self.gameStatus.turn);
            /* Determine if turn is played out fully */
            if ((currPlayer.fantasyland &&
                currPlayer.turnNumber >= 1 &&
                currPlayer.unplayed.length <= gr.fantasyDraw.discard) ||
                (currPlayer.turnNumber === 1 &&
                    currPlayer.unplayed.length <= gr.firstDraw.discard ) ||
                (currPlayer.turnNumber > 1 &&
                    currPlayer.unplayed.length <= gr.draw.discard)) {

                /* Set turn to next player */
                var nextTurn = (self.gameStatus.turnOrder.indexOf(self.username) + 1) % self.gameStatus.turnOrder.length;
                self.gameStatus.turn = self.gameStatus.turnOrder[nextTurn];
                self.gameStatus.dealtTurn = false;

                //increment the player's turn number
                currPlayer.turnNumber++;

                //discard remainder of hand
                currPlayer.unplayed.length = 0;

                //deal the next hand
                self.deal();

                return true;
            } else {
                console.warn('Cannot end turn. You must play your cards first.');
                return false;
            }
        }
    },
    addPlayer: function (name, playerId) {
        var self = this;
        var gr = self.rules.game;
        if (self.getPlayer(playerId)) {
            //already in the game
            return true;
        } else if (self.players.length === gr.maxPlayers) {
            console.warn('Cannot add Player. Game is Full.');
            return false;
        } else if (self.gameStatus.started) {
            console.warn('Cannot add Player. Game has Started.');
            return false;
        } else {
            var playerOpts = {};
            if (name) playerOpts.name = name;
            if (playerId) playerOpts.playerId = playerId;

            var newPlayer = new Player(playerOpts, self.rules.game.playerRules);

            self.players.push(newPlayer);
            self.gameStatus.turnOrder.push(newPlayer.playerId);
            return true;
        }
    },
    getData: function () {
        return {
            name: this.name,
            created: this.created,
            deck: this.deck.getData(),
            players: this.players.map(function (player) {
                return player.getData();
            }),
            gameStatus: this.gameStatus
        };
    },
    setData: function (data) {
        var self = this;

        self.name = data.name || 'untitled';
        self.created = data.created || new Date().getTime();

        /* Generate Deck from deckData if given */
        self.deck = new Deck(data.deck || false);

        /* Generate Players from playerData if needed */
        if (data.players && data.players instanceof Array) {
            self.players = data.players.map(function (playerData) {
                return new Player(playerData, self.rules.game.playerRules);
            });
        } else {
            self.players = [];
        }
        /* Generate Game Status (empty defaulting) */
        data.gameStatus = data.gameStatus ? data.gameStatus : {};
        self.gameStatus = {
            started: data.gameStatus.started || false,
            turnOrder: data.gameStatus.turnOrder || [],
            turn: data.gameStatus.turn || null,
            dealtTurn: data.gameStatus.dealtTurn || false
        }
    },
    resetGame: function() {
        var self = this;
        /* reset players and put them in fantasyland if they made it (and werent in before)*/
        self.players.forEach(function(player) {
           player.resetPlayer(!player.fantasyland && self.rules.fantasyland(player.frontRow));
        });
        self.deck = new Deck(false);

    }
}