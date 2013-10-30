/*global playingCards*/
/*jslint jquery:true */

/**
 * playingCards.ui is a UI utility library extension of the playingCard.js library
 * This contains methods to render the cards and apply effects.
 *
 * @requires playingCards.js [NO LONGER]
 * @requires playingCards.ui.css
 *
 * @author Copyright (c) 2010 Adam Eivy (antic | atomantic)
 * @license Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

/**
 * Modified for JUST displaying cards and no need for images (face cards are basic)
 * by Darren McElligott github/darrenmce
 */


var PlayingCard = function (card) {
    this.rank = card.substr(0, card.length - 1).toUpperCase();
    //change rank from T to 10
    if (this.rank === 'T') {
        this.rank = '10';
    }
    this.suit = card.substr(card.length - 1, 1).toUpperCase();
}
/**
 * generate (and cache) html for the card
 *
 * @return string The HTML block to show the card
 */
PlayingCard.prototype.getHTML = function () {
    if (this.html) {
        return this.html;
    }
    this.suitCode = "&nbsp;";
    this.colorCls = '';
    switch (this.suit) {
        case "S":
            this.suitCode = "&spades;";
            break;
        case "D":
            this.colorCls = "red";
            this.suitCode = "&diams;";
            break;
        case "C":
            this.suitCode = "&clubs;";
            break;
        case "H":
            this.colorCls = "red";
            this.suitCode = "&hearts;";
            break;
    }

    // concatenating strings with "+" is slow, using array join is faster: http://code.google.com/speed/articles/optimizing-javascript.html
    // TODO: run perf test to be sure that in this case we are getting better perf in IE
    var txt = this.rank;
    if (this.rank === "N") {
        txt = this.rankString.split('').join('<br />');
    }
    var strBuild = ['<div class="playingCard"><div class="front ', this.colorCls, '"><div class="corner">', txt, '<br />', this.suitCode, '</div>'];
    strBuild = strBuild.concat(this.buildIconHTML());
    strBuild = strBuild.concat('<div class="corner cornerBR flip">', txt, '<br />', this.suitCode, '</div></div></div>');
    this.html = strBuild.join('');
    return this.html;
};
/**
 * build the middle of the playing card HTML
 *
 * @return string The HTML block for the middle of the card
 */
PlayingCard.prototype.buildIconHTML = function () {
    if (this.rank === "A") {
        return ['<div class="suit suit0">', this.suitCode, '</div>'];
    }
    if (this.rank === "J" || this.rank === "Q" || this.rank === "K" || this.rank === "N") {
        return [
            '<div class="suit A1">', this.suitCode, '</div>',
            '<div class="suit suit0">', this.rank, '</div>',
            '<div class="suit C5 flip">', this.suitCode, '</div>'
        ];
    }
    var ret = [],
        list = ['4', '5', '6', '7', '8', '9', '10'];
    // all of these will have A1, A5, C1, C5 icons
    if (list.indexOf(this.rank) !== -1) {
        ret = ret.concat([
            '<div class="suit A1">', this.suitCode, '</div>',
            '<div class="suit A5 flip">', this.suitCode, '</div>',
            '<div class="suit C1">', this.suitCode, '</div>',
            '<div class="suit C5 flip">', this.suitCode, '</div>'
        ]);
    }
    list = ['2', '3'];
    if (list.indexOf(this.rank) !== -1) {
        ret = ret.concat([
            '<div class="suit B1">', this.suitCode, '</div>',
            '<div class="suit B5 flip">', this.suitCode, '</div>'
        ]);
    }
    list = ['3', '5', '9'];
    if (list.indexOf(this.rank) !== -1) {
        ret = ret.concat([
            '<div class="suit B3">', this.suitCode, '</div>'
        ]);
    }
    list = ['6', '7', '8'];
    if (list.indexOf(this.rank) !== -1) {
        ret = ret.concat([
            '<div class="suit A3">', this.suitCode, '</div>',
            '<div class="suit C3">', this.suitCode, '</div>'
        ]);
    }
    list = ['7', '8', '10'];
    if (list.indexOf(this.rank) !== -1) {
        ret = ret.concat([
            '<div class="suit B2">', this.suitCode, '</div>'
        ]);
    }
    list = ['8', '10'];
    if (list.indexOf(this.rank) !== -1) {
        ret = ret.concat([
            '<div class="suit B4 flip">', this.suitCode, '</div>'
        ]);
    }
    list = ['9', '10'];
    if (list.indexOf(this.rank) !== -1) {
        ret = ret.concat([
            '<div class="suit A2">', this.suitCode, '</div>',
            '<div class="suit A4 flip">', this.suitCode, '</div>',
            '<div class="suit C2">', this.suitCode, '</div>',
            '<div class="suit C4 flip">', this.suitCode, '</div>'
        ]);
    }
    return ret;
};
