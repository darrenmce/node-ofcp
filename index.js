var express = require('express');
var FirebaseTokenGenerator = require('firebase-token-generator');
var fs = require('fs');
var pokerEval = require('./poker-evaluator');
/* Firebase */

//Read in root and secret
var FIREBASE_CONFIG = JSON.parse(fs.readFileSync(__dirname + '/FIREBASE_CONFIG.json', 'utf8'));

var FIREBASE = {
    tokenGenerator: new FirebaseTokenGenerator(FIREBASE_CONFIG.SECRET),
    TOKEN_DURATION: 3600, //seconds
    ROOT: FIREBASE_CONFIG.ROOT,
    SCOPE: 'ofcp',
    DEBUG: true
};

var RG_ILLEGAL_FILES = /^[^\\/:\*\?"<>\|]+$/;
/* Express Setup */
var app = express();
/* set up cookies for session */
app.use(express.cookieParser());
app.use(express.session({secret: 'DUMMYSECRET12345'}));

/* set up body parser */
app.use(express.bodyParser());

/* login :  Logs into the app
 * */

function login(req, res) {
    if (req.body) {
        var username = req.body.username || false;
        var password = req.body.password || '';
        //test login only for now
        if (username.substr(0,4) === 'test' && password === 'test') {
            //set session
            req.session.username = username;
            res.send({
                username: username
            });
        } else {
            res.send(403, 'Log in failed.');
        }
    } else {
        res.send(403, 'Log in failed.');
    }
}
app.post('/login', login);

/* logout :  Logs out of the app
 * */
function logout(req,res) {
    console.log('Logging out: ' + req.session.username);
    req.session.username = null;
    console.log('logged out?: ' + req.session.username);

    res.send({logout: true});
}
app.get('/logout', logout);


/* getFireBase :  Firebase Authentication Token + Root URL
 *
 * 1) create and send a valid auth token for the firebase datasource
 * 2) send the fire base instance of the URL
 *
 * response = { token: token, root: root }
 *
 * */
function getFireBase(req, res) {
    if (req.session.username) {
        console.log('Generating Firebase Token for: ' + req.session.username);
        /* timestamps for expiry */
        var tokenExpiry = (new Date().getTime() / 1000) + FIREBASE.TOKEN_DURATION;

        /* generate a token to be given */
        var fbToken = FIREBASE.tokenGenerator.createToken({
            root: FIREBASE.SCOPE,
            read: true,
            write: true,
            username: req.session.username
        }, {
            expires: tokenExpiry,
            debug: FIREBASE.DEBUG
        });

        res.send({
            token: fbToken,
            root: FIREBASE.ROOT + '/' + FIREBASE.SCOPE + '/',
            username: req.session.username
        });
    } else {
        res.send(403, 'Log in first.');
    }
}

app.get('/getFireBase', getFireBase);


function getScript(req, res) {
    if (req.session.username) {
        var filename = req.param('script');
        console.log('getting script: ' + filename);
        if (RG_ILLEGAL_FILES.test(filename)) {
            res.sendfile(__dirname + (req.param('vendor') ? '/app/scripts/js/vendor/' : '/app/scripts/js/') + filename);
        } else {
            res.send(403, 'Invalid Script: ' + filename);
        }
    } else {
        res.send(403, 'log in first.');
    }
}

function getCss(req, res) {
    if (req.session.username) {
        var filename = req.param('css');
        console.log('getting css: ' + filename);
        if (RG_ILLEGAL_FILES.test(filename)) {
            res.sendfile(__dirname + '/app/scripts/css/' + filename);
        } else {
            res.send(403, 'Invalid Script: ' + filename);
        }
    } else {
        res.send(403, 'log in first.');
    }
}

function getFont(req, res) {
    if (req.session.username) {
        var filename = req.param('font');
        console.log('getting font: ' + filename);
        if (RG_ILLEGAL_FILES.test(filename)) {
            res.sendfile(__dirname + '/app/scripts/fonts/' + filename);
        } else {
            res.send(403, 'Invalid Script: ' + filename);
        }
    } else {
        res.send(403, 'log in first.');
    }
}

function evaluate(players) {
    return players.map(function(player) {
        return {
            playerId: player.playerId,
            frontRow: pokerEval.evalHand(player.frontRow),
            midRow: pokerEval.evalHand(player.midRow),
            backRow: pokerEval.evalHand(player.backRow)
        };
    });
}

function postEvaluate(req,res) {
    if(req.session.username) {
        if (req.body && req.body.players) {
            res.send(evaluate(req.body.players));
        } else {
            res.send(500,'Incorrect');
        }
    } else {
        res.send(403, 'log in first.');
    }
}

app.post('/eval', postEvaluate);

app.get('/scripts/js/:script', getScript);
app.get('/scripts/css/:css', getCss);
app.get('/scripts/fonts/:font', getFont);
app.get('/scripts/js/:vendor/:script', getScript);

app.get('/', function (req, res) {
    if (req.session.username) {
        res.sendfile(__dirname + '/app/index.html');
    } else {
        res.sendfile(__dirname + '/app/login.html');
    }
});


/* Start the Express App */
app.listen(3000);
console.log('Listening on port 3000');