var Login = function (FIREBASE, MONGO) {
    this.FIREBASE = FIREBASE || {};
    this.MONGO = MONGO;
    this.Mongo = require('mongodb').MongoClient;
    this.bcrypt = require('bcrypt');
    this.SALT_WORK_FACTOR = 5;
};

Login.prototype.register = function register(req, res) {
    var self=this;

    if (req.body) {
        var username = req.body.username || false;
        var password = req.body.password || false;
        var email = req.body.email || false;

        if (username && password && email) {

            //bcrypt digest password


            //lower-case username and email
            username = username.toLowerCase();
            email = email.toLowerCase();


            self.bcrypt.hash(password, self.SALT_WORK_FACTOR, function (err, bcryptedPassword) {
                //save to db
                var user = {
                    name: username,
                    pass: bcryptedPassword,
                    email: email
                };
                self.Mongo.connect(self.MONGO.serverPath, {}, function (err, db) {
                    if (err) {
                        res.send(500, 'DB error.');
                    } else {
                        var coll = db.collection('ofcp.users');
                        coll.count({name: username}, function (err, count) {
                            if (err) {
                                res.send(500, 'DB error.');
                            }
                            else if (count > 0) {
                                console.log('Cannot register user: ' + username + ' - user already exists.');
                                res.send(405, 'User Exists Already.');
                                db.close();
                            } else {
                                coll.insert(user, function (err, docs) {
                                    console.log('Registering user: ' + username);
                                    if (err) {
                                        res.send(500, 'DB error.');
                                    } else {
                                        res.send({success: true});
                                    }
                                    db.close();
                                });
                            }
                        });
                    }
                });
            });
        } else {
            res.send(405, 'Required input not found.');
        }
    } else {
        res.send(403, 'Log in failed.');
    }
};

Login.prototype.login = function login(req, res) {
    var self=this;

    if (req.body) {
        var username = req.body.username || false;
        var password = req.body.password || false;

        if (username && password) {

            //lower-case username
            username = username.toLowerCase();

            self.Mongo.connect(self.MONGO.serverPath, {}, function (err, db) {
                if (err) {
                    res.send(500, 'DB error.');
                } else {
                    var coll = db.collection('ofcp.users');
                    coll.findOne({name: username}, function (err, user) {
                        if (err) {
                            res.send(500, 'DB error.');
                        } else if (!user) {
                            console.log("User doesn't exist: "  + username);
                            res.send(403, 'Log in failed.');
                            db.close();
                        } else {
                            self.bcrypt.compare(password, user.pass, function(err, doesMatch){
                                if (doesMatch){
                                    //set session
                                    req.session.username = username;
                                    db.close();
                                    res.send({
                                        username: username
                                    });

                                }else{
                                    console.log("Login fail, bad password for user: "  + username);
                                    res.send(403, 'Log in failed.');
                                    db.close();
                                }
                            });

                        }
                    });
                }
            });
        }
    } else {
        res.send(403, 'Log in failed.');
    }
};

Login.prototype.logout = function logout(req, res) {
    console.log('Logging out: ' + req.session.username);
    req.session.username = null;
    res.send({logout: true});
};

/* getFireBase :  Firebase Authentication Token + Root URL
 *
 * 1) create and send a valid auth token for the firebase datasource
 * 2) send the fire base instance of the URL
 *
 * response = { token: token, root: root, username: user }
 *
 * */
Login.prototype.getFireBase = function getFireBase(req, res) {
    var self = this;

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
};

module.exports = Login;