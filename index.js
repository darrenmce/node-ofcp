var express = require('express');
var FirebaseTokenGenerator = require('firebase-token-generator');
var fs = require('fs');
/* Firebase */

//Read in root and secret
var FIREBASE_CONFIG = JSON.parse(fs.readFileSync(__dirname + '/FIREBASE_CONFIG.json', 'utf8'));

var FIREBASE = {
    tokenGenerator: new FirebaseTokenGenerator(FIREBASE_CONFIG.SECRET),
    TOKEN_DURATION: 600, //seconds
    ROOT: FIREBASE_CONFIG.ROOT,
    SCOPE: 'ofcp',
    DEBUG: true
};

var RG_ILLEGAL_FILES = /^[^\\/:\*\?"<>\|]+$/;
/* Express Setup */
var app = express();

/* getFireBase :  Firebase Authentication Token + Root URL
 *
 * 1) create and send a valid auth token for the firebase datasource
 * 2) send the fire base instance of the URL
 *
 * response = { token: token, root: root }
 *
 * */
function getFireBase (req, res) {
    /* timestamps for expiry */
    var tokenExpiry = (new Date().getTime() / 1000) + FIREBASE.TOKEN_DURATION;

    /* generate a token to be given */
    var fbToken = FIREBASE.tokenGenerator.createToken({
        root: FIREBASE.SCOPE,
        read: true,
        write: true
    }, {
        expires: tokenExpiry,
        debug: FIREBASE.DEBUG
    });

    res.send({
        token: fbToken,
        root: FIREBASE.ROOT + '/' + FIREBASE.SCOPE + '/'
    });
}
app.get('/getFireBase', getFireBase);


function getScript(req, res) {
    var filename = req.param('script');
    console.log('getting script: ' + filename);
    if (RG_ILLEGAL_FILES.test(filename)) {
        res.sendfile(__dirname + '/app/scripts/js/' + filename);
    } else {
        res.send(403, 'Invalid Script: '+filename);
    }
}
app.get('/scripts/:script', getScript);

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/app/index.html');
});


/* Start the Express App */
app.listen(3000);
console.log('Listening on port 3000');