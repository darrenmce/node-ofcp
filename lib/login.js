var Login = function(FIREBASE){
    this.FIREBASE = FIREBASE || {};
}

Login.prototype.login = function login(req, res) {
    if (req.body) {
        var username = req.body.username || false;
        var password = req.body.password || '';
        //test login only for now
        if (username.substr(0, 4) === 'test' && password === 'test') {
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

Login.prototype.logout = function logout(req, res) {
    console.log('Logging out: ' + req.session.username);
    req.session.username = null;
    res.send({logout: true});
}

/* getFireBase :  Firebase Authentication Token + Root URL
 *
 * 1) create and send a valid auth token for the firebase datasource
 * 2) send the fire base instance of the URL
 *
 * response = { token: token, root: root }
 *
 * */
Login.prototype.getFireBase = function getFireBase(req, res) {
    var self=this;

    if (req.session.username) {
        console.log('Generating Firebase Token for: ' + req.session.username);
        /* timestamps for expiry */
        var tokenExpiry = (new Date().getTime() / 1000) + self.FIREBASE.TOKEN_DURATION;

        /* generate a token to be given */
        var fbToken = self.FIREBASE.tokenGenerator.createToken({
            root: self.FIREBASE.SCOPE,
            read: true,
            write: true,
            username: req.session.username
        }, {
            expires: tokenExpiry,
            debug: self.FIREBASE.DEBUG
        });

        res.send({
            token: fbToken,
            root: self.FIREBASE.ROOT + '/' + self.FIREBASE.SCOPE + '/',
            username: req.session.username
        });
    } else {
        res.send(403, 'Log in first.');
    }
}

module.exports.Login = Login;