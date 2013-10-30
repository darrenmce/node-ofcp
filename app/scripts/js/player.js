var Player = function (options, rules) {
    var opt = options ? options : {};
    this.rules = rules;
    this.setData(opt);
};

Player.prototype = {
    /* plays the card to a row
     * row: 0 = back, 1 = mid, 2 = front
     *
     * returns boolean based on success
     * */
    playCard: function (row, card) {
        var self = this;
        var rowArray, maxSize
            , unplayedIndex = self.unplayed.indexOf(card);

        if (row === 0) {
            rowArray = self.backRow;
            maxSize = self.rules.rows.backRow;
        } else if (row === 1) {
            rowArray = self.midRow;
            maxSize = self.rules.rows.midRow;
        } else {
            rowArray = self.frontRow;
            maxSize = self.rules.rows.frontRow;
        }

        if (rowArray.length < maxSize && unplayedIndex >= 0) {
            //add to row
            rowArray.push(card);
            //remove from unplayed
            self.unplayed.splice(unplayedIndex,1);
            return true;
        } else {
            console.warn('Cannot play card, you do not have this card or the row is full.');
            return false;
        }
    },
    dealTo: function (cards) {
        if (cards instanceof Array) {
            this.unplayed = this.unplayed.concat(cards);
        } else {
            this.unplayed.push(cards);
        }
    },
    getData: function () {
        return {
            name: this.name,
            backRow: this.backRow,
            midRow: this.midRow,
            frontRow: this.frontRow,
            unplayed: this.unplayed,
            playerId: this.playerId,
            turnNumber: this.turnNumber,
            fantasyland: this.fantasyland
        };
    },
    setData: function (data) {
        this.name = data.name || 'unnamed';
        this.backRow = data.backRow || [];
        this.midRow = data.midRow || [];
        this.frontRow = data.frontRow || [];
        this.unplayed = data.unplayed || [];
        this.playerId = data.playerId || _.uniqueId('player_');
        this.turnNumber = data.turnNumber || 1;
        this.fantasyland = data.fantasyland || false;
    },
    resetPlayer: function(fantasyland) {
        this.backRow = [];
        this.midRow = [];
        this.frontRow =[];
        this.unplayed = [];
        this.turnNumber = 1;
        this.fantasyland = fantasyland;
    }
};