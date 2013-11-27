/*
 * Assumes global existence of of:
 *
 * currentGame
 * gamesModel
 * */
var GameFunc = {
    /* gameSync
     *
     * sync the local game object to:
     *   the knockout model
     *   the firebase instance
     * */
    gameSync: function () {
        var gameData = currentGame.game.getData();
        gamesModel.game({gameId: currentGame.gameId, game: gameData});
        fire.child('games').child(currentGame.gameId).set(gameData);
    },
    /* gameParse
     *
     * subscriber to the knockout game model
     * update the currentGame based on model changes
     */
    gameParse: function (data) {
        if (!data.gameId) {
            //do nothing
        } else if (currentGame.game && currentGame.gameId === data.gameId) {
            currentGame.game.setData(data.game);
        } else {
            currentGame.gameId = data.gameId;
            currentGame.game = new Game(username, rules, data.game);
            //try to join the game
            currentGame.game.addPlayer(username, username);
            GameFunc.gameSync();
        }
    },

    /* parseFireGame
     *
     * helper function to parse the data recieved from FireBase into the knockout model
     */
    parseFireGame: function (data) {
        gamesModel.game({gameId: data.name(), game: new Game(username, rules, data.val()).getData()});
    },

    /* joinGame
     *
     * simply swaps firebase event listener from previous game (if exists) to this game.
     */
    joinGame: function (gameId) {
        //remove listener for any previous game
        if (gamesModel.game().gameId) {
            fire.child('games').child(gamesModel.game().gameId).off('value', GameFunc.parseFireGame);
        }
        //add listener for this game
        fire.child('games').child(gameId).on('value', GameFunc.parseFireGame);
    },
    /* createGame
     *
     * creates a new game in FireBase
     */
    createGame: function (name) {
        fire.child('games').push(new Game(username, rules, {name: name}).getData());
    },
    /* leaveGame
     *
     * Leave your current game - return to lobby
     * */
    leaveGame: function () {
        fire.child('games').child(gamesModel.game().gameId).off('value', GameFunc.parseFireGame);
        currentGame = {};
        gamesModel.game({});
    },
    /* updateGameList
     *
     * helper function to update the game list based on the data from FireBase
     */
    updateGameList: function (data) {
        //update gameList
        gamesModel.gameList(
            _.map(data.val(), function (data, key) {
                return {gameId: key, name: data.name || 'untitled'};
            }));
    }
}

