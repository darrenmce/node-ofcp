/*
 * Utility functions
 */
var Util = {
    //get card HTML for the given card
    cardHTML: function (card) {
        if (card === 'back') {
            return '<div class="playingCard cardBack"><img draggable="false" src="images/back.gif"/></div>';
        } else if (card) {
            return new PlayingCard(card).getHTML();
        } else {
            return '<div class="playingCard"></div>';
        }
    }
}