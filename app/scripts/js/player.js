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
            self.unplayed.splice(unplayedIndex, 1);
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
            fantasyland: this.fantasyland,
            evalHands: this.evalHands,
            totalScore: this.totalScore
        };
    },
    getBoard: function() {
      return {
        backRow: this.backRow,
        midRow: this.midRow,
        frontRow: this.frontRow
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
        this.evalHands = data.evalHands || false;
        this.totalScore = data.totalScore || 0;
    },
    /* Resets the player status for the next round */
    resetPlayer: function (fantasyland) {
        this.backRow = [];
        this.midRow = [];
        this.frontRow = [];
        this.unplayed = [];
        this.turnNumber = 1;
        this.fantasyland = fantasyland;
        this.evalHands = false;
    },
    /* Returns true if a fault is deteted and handled. Required the player hands to be evaluated.*/
    faultHandler: function () {
        var self = this;
        if (self.evalHands) {
            if (self.evalHands.frontRow.value <= self.evalHands.midRow.value &&
                self.evalHands.midRow.value <= self.evalHands.backRow.value) {
                return false;
            } else {
                var fault = {
                    handType: 0,
                    handRank: 0,
                    value: 0,
                    handName: "fault"
                };
                //set faults
                self.evalHands.frontRow = fault;
                self.evalHands.midRow = fault;
                self.evalHands.backRow = fault;
                return true;
            }
        } else {
            return false;
        }
    },
    addPoints: function(points) {
        this.totalScore += points;
    }
};