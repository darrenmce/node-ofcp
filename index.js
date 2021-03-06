/* Deps */
var express = require('express');
var FirebaseTokenGenerator = require('firebase-token-generator');
var fs = require('fs');

/* Lib */
var loginFunc = require('./lib/login.js');
var aiFunc = require('./lib/ai.js');
var evaluate = require('./lib/evaluate.js');

var FIREBASE_CONFIG = JSON.parse(fs.readFileSync(__dirname + '/FIREBASE_CONFIG.json', 'utf8'));
var SERVER_CONFIG = JSON.parse(fs.readFileSync(__dirname + '/SERVER_CONFIG.json', 'utf8'));
var MONGO_CONFIG = JSON.parse(fs.readFileSync(__dirname + '/MONGO_CONFIG.json', 'utf8'));
var AI_CONFIG = JSON.parse(fs.readFileSync(__dirname + '/AI_CONFIG.json', 'utf8'));

var FIREBASE = {
    tokenGenerator: new FirebaseTokenGenerator(FIREBASE_CONFIG.SECRET),
    TOKEN_DURATION: 3600, //seconds
    ROOT: FIREBASE_CONFIG.ROOT,
    SCOPE: 'ofcp',
    DEBUG: FIREBASE_CONFIG.DEBUG.toUpperCase() === 'Y'
};

var MONGO = {
    serverPath: MONGO_CONFIG.SERVER + '/' + MONGO_CONFIG.DATABASE
};

var RG_ILLEGAL_FILES = /^[^\\/:\*\?"<>\|]+$/;
/* Express Setup */
var app = express();
/* set up cookies for session */
app.use(express.cookieParser());
app.use(express.session({secret: 'DUMMYSECRET12345'}));

/* set up body parser */
app.use(express.bodyParser());

var login = new loginFunc(FIREBASE, MONGO);
app.post('/login', login.login.bind(login));
app.post('/register', login.register.bind(login));
app.get('/logout', login.logout.bind(login));
/* Uses context of login object */
app.get('/getFireBase', login.getFireBase.bind(login));

/* set up AI API */
var ai = new aiFunc(AI_CONFIG.host, AI_CONFIG.path);

app.post('/ai', ai.getWrapper.bind(ai));


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

function getImage(req, res) {
    if (req.session.username) {
        var filename = req.param('image');
        console.log('getting image: ' + filename);
        if (RG_ILLEGAL_FILES.test(filename)) {
            res.sendfile(__dirname + '/app/images/' + filename);
        } else {
            res.send(403, 'Invalid Script: ' + filename);
        }
    } else {
        res.send(403, 'log in first.');
    }
}



function getConfig(req, res) {
    res.set('Content-Type', 'text/javascript');
    res.send('var server = "' + (SERVER_CONFIG.REQUEST_ADDRESS || (SERVER_CONFIG.ADDRESS+':'+SERVER_CONFIG.PORT)) + '";');
}

app.get('/config', getConfig);

app.post('/eval', evaluate.postEvaluate.bind(evaluate));

app.get('/scripts/js/:script', getScript);
app.get('/scripts/css/:css', getCss);
app.get('/scripts/fonts/:font', getFont);
app.get('/scripts/js/:vendor/:script', getScript);
app.get('/images/:image', getImage);

app.get('/', function (req, res) {
    if (req.session.username) {
        res.sendfile(__dirname + '/app/index.html');
    } else {
        res.sendfile(__dirname + '/app/login.html');
    }
});


/* Start the Express App */
app.listen(SERVER_CONFIG.PORT);
console.log('Listening on port ' + SERVER_CONFIG.PORT);
