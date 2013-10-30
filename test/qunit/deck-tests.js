var basedeck = ["2c", "2d", "2h", "2s",
    "3c", "3d", "3h", "3s",
    "4c", "4d", "4h", "4s",
    "5c", "5d", "5h", "5s",
    "6c", "6d", "6h", "6s",
    "7c", "7d", "7h", "7s",
    "8c", "8d", "8h", "8s",
    "9c", "9d", "9h", "9s",
    "tc", "td", "th", "ts",
    "jc", "jd", "jh", "js",
    "qc", "qd", "qh", "qs",
    "kc", "kd", "kh", "ks",
    "ac", "ad", "ah", "as"];

var cardNumbers = ['2', '3', '4', '5', '6', '7', '8', '9', 't', 'j', 'q', 'k', 'a'];
var cardSuits = ['c', 'd', 'h', 's'];

test("Create Deck.", function () {
    var deck = new Deck();
    ok(deck instanceof Deck, "Passed!");
});

test("Deck Cards.", function () {
    /* New Deck Cards */
    var deck = new Deck();
    ok(deck.cards.length === 52, "52 cards");
    ok(_.difference(basedeck, deck.cards).length === 0, "deck integrity.");

    /* Shuffle */
    deck.shuffle();
    ok(deck.cards.length === 52, "52 cards after shuffle");
    ok(_.difference(basedeck, deck.cards).length === 0, "shuffle maintains integrity.");


    function drawTest(num) {
        var cards = deck.draw(num);
        ok(cards.length === num, num + " card(s) returned");

        //no need to empty-trap these, above would fail;
        var validNumbers = true;
        var validSuits = true;
        var indexTest = true;
        cards.forEach(function (card) {
            validNumbers = validNumbers && cardNumbers.indexOf(card.charAt(0)) >= 0;
            validSuits = validSuits && cardSuits.indexOf(card.charAt(1)) >= 0;
            indexTest = indexTest && deck.cards.indexOf(card) === -1;
        });
        ok(validNumbers, num + " card(s) all valid numbers");
        ok(validSuits, num + " card(s) all valid suits");
        ok(_.uniq(cards).length === num, num + " card(s) all unique");
        ok(indexTest, num + " card(s) all removed from deck");
    }

    /* Draw Card */
    drawTest(1);

    /* Draw 5 Cards */
    drawTest(5);

    /* Draw the last cards */
    drawTest(deck.cards.length);
    ok(deck.cards.length === 0, "deck should now be empty");

});