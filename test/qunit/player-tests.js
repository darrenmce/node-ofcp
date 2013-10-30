var testRules = {
    rows: {
        frontRow: 3,
        midRow: 5,
        backRow: 5
    }
};
var testPlayerOpt = {
    name: "testPlayer",
    playerId: "testPlayerId"
};
var testCard = '2c';
var testCards = [
    '4h', 'as', 'jh', 'td'
];

test("Create Player", function () {
    var player = new Player(testPlayerOpt, testRules);
    ok(player instanceof Player, "Passed!");
});

test("Deal To Player", function () {
    var player = new Player(testPlayerOpt, testRules);

    /* Empty Checks */
    ok(player.unplayed.length === 0, 'unplayed starts empty.');


    /* Deal One Card as string */
    player.dealTo(testCard);
    ok(player.unplayed.length === 1, 'unplayed dealt one as string.');

    //empty hand
    player.unplayed.length = 0;

    /* Deal One Card as array */
    player.dealTo([testCard]);
    ok(player.unplayed.length === 1, 'unplayed dealt one as array.');

    /* Deal 4 more Cards as Array*/
    player.dealTo(testCards);
    ok(player.unplayed.length === testCards.length + 1, 'unplayed dealt ' + testCards.length + ' more as array.');

});

test("Player Play Cards", function () {
    var player = new Player(testPlayerOpt, testRules);

    /* Empty Checks */
    ok(player.frontRow.length === 0, 'frontRow starts empty.');
    ok(player.midRow.length === 0, 'midRow starts empty.');
    ok(player.backRow.length === 0, 'backRow starts empty.');

    //Deal 5 cards
    player.dealTo(testCard);
    player.dealTo(testCards);

    /* Play one card to frontRow */
    ok(player.playCard(2, testCard), "played "+testCard+" to frontRow.");
    ok(player.unplayed.length === testCards.length, "unplayed adjusted accordingly");
    ok(player.frontRow[0] === testCard, "frontRow now has "+testCard+ " in it");

    /* Play 2 Subsequent Cards */
    ok(player.playCard(2,testCards[0]),"played "+ testCards[0]+" to frontRow");
    ok(player.playCard(2,testCards[1]),"played "+ testCards[1]+" to frontRow");

    /* Play 1 more card to full row*/
    ok(!player.playCard(2,testCards[2]),"false returned: played "+ testCards[2]+" to frontRow - row was full");


    /* Play a card you don't have */
    var prevUnplayed = player.unplayed.slice(0), prevFrontRow = player.frontRow.slice(0);
    ok(!player.playCard(2,'ks'), "false returned trying to play a card not in unplayed");
    ok(_.isEqual(prevUnplayed, player.unplayed) && _.isEqual(prevFrontRow,player.frontRow), "playing card not in unplayed does not change unplayed/row");

});