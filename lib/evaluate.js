var pokerEval = require('../poker-evaluator');

var Evaluate = {
  evaluate: function (players) {
    var self = this;
    return players.map(function (player) {
      return {
        playerId: player.playerId,
        frontRow: pokerEval.evalHand(player.frontRow),
        midRow: self._royalFlushFix(pokerEval.evalHand(player.midRow), player.midRow),
        backRow: self._royalFlushFix(pokerEval.evalHand(player.backRow), player.backRow)
      };
    });
  },
  postEvaluate: function (req, res) {
    if (req.session.username) {
      if (req.body && req.body.players) {
        res.send(this.evaluate(req.body.players));
      } else {
        res.send(500, 'Incorrect');
      }
    } else {
      res.send(403, 'log in first.');
    }
  },
  _royalFlushFix: function (evalHand, hand) {
    if (evalHand.handName === 'straight flush') {
      var cardVals = hand.map(function (card) {
        return card.substr(0, 1).toLowerCase();
      });
      if (cardVals.indexOf('a') >= 0 && cardVals.indexOf('t') >= 0) {
        //royal flush!
        evalHand.handName = 'royal flush';
        evalHand.handType = '10';
      }

    }
    return evalHand;
  }
};

module.exports = Evaluate;