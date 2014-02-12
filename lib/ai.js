var http = require('http');

var Ai = function(host,path) {
  this.host = host;
  this.path = path;
  this.url = host+path;
}

Ai.prototype = {
  _get: function (p1, p2, open, callback) {

    //create query string
    var query = '?';
    query += 'p1='+p1.frontRow.join('')+'%2f'+p1.midRow.join('')+'%2f'+p1.backRow.join('');
    query += '&';
    query += 'p2='+p2.frontRow.join('')+'%2f'+p2.midRow.join('')+'%2f'+p2.backRow.join('');
    query += '&';
    query += 'open='+open.join('');

    //retrieve result
    http.get(this.url + query, function(res) {
      console.log('AI req: ' + res.statusCode);
      res.setEncoding('utf8');
      res.on('data', function (data) {
        callback(JSON.parse(data));
      });
    }).on('error', function(err){
        console.log('ERROR: ' + err.message);
      });
  },
  getWrapper: function(req, res) {
    if (req.body) {
      var p1 = req.body.p1 || {frontRow: [], midRow: [], backRow: []};
      var p2 = req.body.p2 || {frontRow: [], midRow: [], backRow: []};
      var open = req.body.open || [];
      this._get(p1, p2, open, function(data) {
        res.send(data);
      });
    }
  }
};

module.exports = Ai;