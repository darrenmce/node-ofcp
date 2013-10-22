var Game = function (username, options) {
    var opt = options ? options : {};
    this.username = username;
    this.setData(opt);
}

Game.prototype = {
    startGame: function(first) {
        var self = this;
        var turn = first || _.random(0,self.players.length-1);
        self.gameStatus.turn = self.players[turn].playerId;
    },
    endTurn: function() {
        if (true) {}
    },
    addPlayer: function (name, playerId) {
        var self = this;
        if (self.players.length === 4) {
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
            turnOrder: data.gameStatus.turnOrder || []
        }
    }
}