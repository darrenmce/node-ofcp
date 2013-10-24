var Game = function (username, options) {
    var opt = options ? options : {};
    this.username = username;
    this.setData(opt);
}

Game.prototype = {
    startGame: function (first) {
        var self = this;
        if (!self.gameStatus.started) {
            var self = this;
            var turn = first || _.random(0, self.players.length - 1);
            self.gameStatus.turn = self.players[turn].playerId;
            self.gameStatus.started = true;
        }
    },
    deal: function () {
        var self = this;

        if (self.gameStatus.dealtTurn) {
            console.warn('Already dealt this turn.');
            return false;
        } else {
            var currPlayer = self.getPlayer(self.gameStatus.turn)
                , turnNumber = currPlayer.turnNumber;
            if (turnNumber < 6) {
                if (currPlayer.fantasyland) {
                    currPlayer.dealTo(self.deck.draw(14));
                    currPlayer.turnNumber = 5;
                } else if (turnNumber === 1) {
                    currPlayer.dealTo(self.deck.draw(5));
                    self.gameStatus.dealtTurn = true;
                    return true;
                } else if (turnNumber < 6) {
                    currPlayer.dealTo(self.deck.draw(3));
                    self.gameStatus.dealtTurn = true;
                    return true;
                }
            } else {
                console.warn('All cards dealt.');
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
        if (self.username === self.gameStatus.turn) {
            var currPlayer = self.getPlayer(self.gameStatus.turn);
            if ((currPlayer.turnNumber === 1 && currPlayer.unplayed.length === 0) ||
                (currPlayer.turnNumber > 1 && currPlayer.unplayed.length <= 1)) {
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
        if (self.getPlayer(playerId)) {
            //already in the game
            return true;
        } else if (self.players.length === 3) {
            console.warn('Cannot add Player. Game is Full.');
            return false;
        } else if (self.gameStatus.started) {
            console.warn('Cannot add Player. Game has Started.');
            return false;
        } else {
            var playerOpts = {};
            if (name) playerOpts.name = name;
            if (playerId) playerOpts.playerId = playerId;

            var newPlayer = new Player(playerOpts);

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
                return new Player(playerData);
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
    }
}