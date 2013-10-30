var Deck = function (options) {
    var opt = options ? options : {};
    this.setData(opt);
};

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
    },
    getData: function () {
        return {
            cards: this.cards
        };
    },
    setData: function (data) {
        this.cards = data.cards || [
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
};
