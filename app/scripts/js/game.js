var Game = function (username, rules, options) {
    var opt = options ? options : {};
    this.username = username;
    this.rules = rules;
    this.setData(opt);
};

Game.prototype = {
    startGame: function (first) {
        var self = this;
        if (!self.gameStatus.started) {
            self.resetGame();
            var turn = first || _.random(0, self.players.length - 1);
            self.gameStatus.turn = self.players[turn].playerId;
            self.gameStatus.started = true;
        }
    },
    deal: function () {
        var self = this;
        /* game rules */
        var gr = self.rules.game;

        if (self.gameStatus.dealtTurn) {
            console.warn('Already dealt this turn.');
            return false;
        } else {
            var currPlayer = self.getPlayer(self.gameStatus.turn)
                , turnNumber = currPlayer.turnNumber;
            if (turnNumber > 1 && currPlayer.fantasyland) {
                /* skip the deal if fantasyland has been dealt */
                self.gameStatus.dealtTurn = true;
                self.endTurn(true);
                return true;
            } else if (turnNumber < gr.maxTurns) {
                if (currPlayer.fantasyland) {
                    /* Fantasyland Draw */
                    currPlayer.dealTo(self.deck.draw(gr.fantasyDraw.cards));
                    self.gameStatus.dealtTurn = true;
                    return true;
                } else if (turnNumber === 1) {
                    /* Inital Draw */
                    currPlayer.dealTo(self.deck.draw(gr.firstDraw.cards));
                    self.gameStatus.dealtTurn = true;
                    return true;
                } else if (turnNumber < gr.maxTurns) {
                    /* Regular Draw */
                    currPlayer.dealTo(self.deck.draw(gr.draw.cards));
                    self.gameStatus.dealtTurn = true;
                    return true;
                }
            } else {
                /* Game is Over! */
                console.warn('Game Over!');

                //call gameOver handler
                self.gameOverHandler();
                /* Flip game 'started' back to false */
                self.gameStatus.started = false;
                return false;
            }
        }

    },
    //get the current turn player obj
    getPlayer: function (playerId) {
        var self = this;
        return $.grep(self.players, function (player) {
            return player.playerId.toLowerCase() === playerId.toLowerCase();
        })[0];
    },
    //override to allow other user to end turn
    endTurn: function (override) {
        var self = this;
        /* game rules */
        var gr = self.rules.game;
        if (self.username === self.gameStatus.turn || override) {
            var currPlayer = self.getPlayer(self.gameStatus.turn);
            /* Determine if turn is played out fully */
            if ((currPlayer.fantasyland &&
                currPlayer.turnNumber >= 1 &&
                currPlayer.unplayed.length <= gr.fantasyDraw.discard) ||
                (currPlayer.turnNumber === 1 &&
                    currPlayer.unplayed.length <= gr.firstDraw.discard ) ||
                (currPlayer.turnNumber > 1 &&
                    currPlayer.unplayed.length <= gr.draw.discard)) {

                //increment the player's turn number
                currPlayer.turnNumber++;

                //discard remainder of hand
                currPlayer.unplayed.length = 0;

                /* Set turn to next player */
                var nextTurn = (self.gameStatus.turnOrder.indexOf(self.gameStatus.turn) + 1) % self.gameStatus.turnOrder.length;
                self.gameStatus.turn = self.gameStatus.turnOrder[nextTurn];
                self.gameStatus.dealtTurn = false;

                //deal the next hand
                self.deal();

                return true;
            } else {
                return false;
            }
        }
    },
    addPlayer: function (name, playerId) {
        var self = this;
        var gr = self.rules.game;
        if (self.getPlayer(playerId)) {
            //already in the game
            return true;
        } else if (self.players.length === gr.maxPlayers) {
            console.warn('Cannot add Player. Game is Full.');
            return false;
        } else if (self.gameStatus.started) {
            console.warn('Cannot add Player. Game has Started.');
            return false;
        } else {
            var playerOpts = {};
            if (name) {
                playerOpts.name = name;
            }
            if (playerId) {
                playerOpts.playerId = playerId;
            }

            var newPlayer = new Player(playerOpts, self.rules.game.playerRules);

            self.players.push(newPlayer);
            self.gameStatus.turnOrder.push(newPlayer.playerId);
            return true;
        }
    },
    removePlayer: function (playerId) {
        var self = this;
        if (self.getPlayer(playerId)) {
            //remove the player
            //TODO handle gameStatus changes such as turnorder and turn
            self.players = _.reject(self.players, function(player) {
                return player.playerId.toLowerCase() === playerId.toLowerCase();
            });
            return true;
        } else {
            //not in game
            return false;
        }
    },
    getData: function () {
        return {
            name: this.name,
            created: this.created,
            deck: this.deck.getData(),
            players: this.players.map(function (player) {
                return player.getData();
            }),
            gameStatus: this.gameStatus
        };
    },
    setData: function (data) {
        var self = this;

        self.name = data.name || 'untitled';
        self.created = data.created || new Date().getTime();

        /* Generate Deck from deckData if given */
        self.deck = new Deck(data.deck || false);

        /* Generate Players from playerData if needed */
        if (data.players && data.players instanceof Array) {
            self.players = data.players.map(function (playerData) {
                return new Player(playerData, self.rules.game.playerRules);
            });
        } else {
            self.players = [];
        }
        /* Generate Game Status (empty defaulting) */
        data.gameStatus = data.gameStatus ? data.gameStatus : {};
        self.gameStatus = {
            started: data.gameStatus.started || false,
            turnOrder: data.gameStatus.turnOrder || [],
            turn: data.gameStatus.turn || null,
            dealtTurn: data.gameStatus.dealtTurn || false,
            winners: data.gameStatus.winners || {}
        };
    },
    resetGame: function () {
        var self = this;
        /* reset players and put them in fantasyland if they made it (and werent in before)*/
        self.players.forEach(function (player) {
            player.resetPlayer(!player.fantasyland && self.rules.fantasyland(player.evalHands.frontRow));
        });

        /* Reset Deck */
        self.deck = new Deck(false);

        /* Clear row winners */
        self.gameStatus.winners = {};
    },
    /* If the game is finished, evaluate the hands
     * requires a url to the evaluator service
     * calls callback with context of response upon success, or this.error is populated upon fail
     * */
    evaluate: function (url, callback) {
        var self = this;
        if (_.every(self.players, function (player) {
            return player.frontRow.length === player.rules.rows.frontRow &&
                player.midRow.length === player.rules.rows.backRow &&
                player.backRow.length === player.rules.rows.backRow;
        })) {
            var cardData = self.players.map(function (player) {
                return {
                    playerId: player.playerId,
                    frontRow: player.frontRow,
                    midRow: player.midRow,
                    backRow: player.backRow
                };
            });
            $.post(url, {players: cardData})
                .done(function (resp) {
                    callback(resp);
                })
                .fail(function () {
                    callback({error: "Failed calling evaluator service"});
                });
        } else {
            callback({error: "Game not over"});
        }
    },
    gameOverHandler: function () {
        var self = this;

        self.evaluate(server + '/eval', function (players) {
            if (players.error) {
                return false;
            } else if (players instanceof Array) {
                var scoring = self.rules.scoring;

                var winners = {
                    frontRow: {
                        playerId: null,
                        value: 0
                    },
                    midRow: {
                        playerId: null,
                        value: 0
                    },
                    backRow: {
                        playerId: null,
                        value: 0
                    }
                };
                //bind evaluate and bonus data to player
                players.forEach(function (evalHand) {
                    var player = self.getPlayer(evalHand.playerId);
                    evalHand.bonus = {};
                    player.evalHands = evalHand;

                    /* Check if the player faulted, otherwise determine bonuses/wins */
                    if (player.faultHandler()) {
                        /* Fault */
                        player.evalHands.bonus = {
                            frontRow: 0,
                            midRow: 0,
                            backRow: 0
                        };
                    } else {

                        //determine row winners, if a tie, set back to null
                        if (evalHand.frontRow.value > winners.frontRow.value) {
                            winners.frontRow = {
                                playerId: evalHand.playerId,
                                value: evalHand.frontRow.value
                            };
                        } else if (evalHand.frontRow.value === winners.frontRow.value) {
                            winners.frontRow = {
                                playerId: null
                            };
                        }
                        if (evalHand.midRow.value > winners.midRow.value) {
                            winners.midRow = {
                                playerId: evalHand.playerId,
                                value: evalHand.midRow.value
                            };
                        } else if (evalHand.midRow.value === winners.midRow.value) {
                            winners.midRow = {
                                playerId: null
                            };
                        }
                        if (evalHand.backRow.value > winners.backRow.value) {
                            winners.backRow = {
                                playerId: evalHand.playerId,
                                value: evalHand.backRow.value
                            };
                        } else if (evalHand.backRow.value === winners.backRow.value) {
                            winners.backRow = {
                                playerId: null
                            };
                        }

                        //frontRow
                        var frontScore = scoring.bonus[evalHand.frontRow.handName].front;
                        if (typeof frontScore === 'object') {
                            //determine repeating card
                            var cardRank = player.frontRow[0].charAt(0) === player.frontRow[1].charAt(0) ? player.frontRow[0].charAt(0) : player.frontRow[2].charAt(0);
                            frontScore = frontScore[cardRank];
                        }
                        evalHand.bonus = {
                            frontRow: frontScore || 0,
                            //midRow & backRow
                            midRow: scoring.bonus[evalHand.midRow.handName].mid || 0,
                            backRow: scoring.bonus[evalHand.backRow.handName].back || 0
                        };
                        //award bonus points
                        player.addPoints(evalHand.bonus.frontRow);
                        player.addPoints(evalHand.bonus.midRow);
                        player.addPoints(evalHand.bonus.backRow);

                        player.evalHands = evalHand;
                    }

                });

                //bind rowWinners to gameStatus
                self.gameStatus.winners = winners;

                //award row win pts
                if (self.gameStatus.winners.frontRow.playerId) {
                    self.getPlayer(self.gameStatus.winners.frontRow.playerId).addPoints(self.rules.scoring.frontRow);
                }
                if (self.gameStatus.winners.midRow.playerId) {
                    self.getPlayer(self.gameStatus.winners.midRow.playerId).addPoints(self.rules.scoring.midRow);
                }
                if (self.gameStatus.winners.backRow.playerId) {
                    self.getPlayer(self.gameStatus.winners.backRow.playerId).addPoints(self.rules.scoring.backRow);
                }
                //award scoop if won
                if (self.gameStatus.winners.frontRow.playerId &&
                    self.gameStatus.winners.frontRow.playerId === self.gameStatus.winners.midRow.playerId &&
                    self.gameStatus.winners.midRow.playerId === self.gameStatus.winners.backRow.playerId) {
                    self.getPlayer(self.gameStatus.winners.frontRow.playerId).addPoints(self.rules.scoring.scoop);
                }

                //sync game
                gameSync();

            }
            else {
                return false;
            }
        });
    }
};