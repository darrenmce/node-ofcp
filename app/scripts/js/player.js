var Player = function (options) {
    var opt = options ? options : {};

    this.setData(opt);
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
    dealTo: function (cards) {
        if (cards instanceof Array) {
            this.unplayed = this.unplayed.concat(cards);
        } else {
            this.unplayed.push(cards);
        }
    },
    getDealtCards: function () {
        return this.backRow.concat(this.midRow, this.frontRow, this.unplayed);
    },
    getData: function () {
        return {
            name: this.name,
            backRow: this.backRow,
            midRow: this.midRow,
            frontRow: this.frontRow,
            unplayed: this.unplayed,
            playerId: this.playerId
        }
    },
    setData: function (data) {
        this.name = data.name || 'unnamed';
        this.backRow = data.backRow || [];
        this.midRow = data.midRow || [];
        this.frontRow = data.frontRow || [];
        this.unplayed = data.unplayed || [];
        this.playerId = data.playerId || _.uniqueId('player_');
    }
}