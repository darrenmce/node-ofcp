var rules = {
    /* Fantasy Land is determined by a pair of Queens on the top or stronger */
    fantasyland: function (frontRow) {
        if (frontRow && frontRow.value) {
            return frontRow.value >= 10393;
        } else {
            return false;
        }
    },
    game: {
        maxPlayers: 3,
        playerRules: {
            rows: {
                frontRow: 3,
                midRow: 5,
                backRow: 5
            }
        },
        maxTurns: 6,
        fantasyDraw: {
            cards: 14,
            discard: 1
        },
        firstDraw: {
            cards: 5,
            discard: 0
        },
        draw: {
            cards: 3,
            discard: 1
        },
        hide: {
            unplayed: true,
            turn: true,
            previous: false
        }
    },
    scoring: {
        scoop: 3,
        backRow: 1,
        midRow: 1,
        frontRow: 1,
        bonus: {
            "fault": {
                handType: 0,
                back: 0,
                mid: 0,
                front: 0
            },
            "high card": {
                handType: 1,
                back: 0,
                mid: 0,
                front: 0
            },
            "one pair": {
                handType: 2,
                back: 0,
                mid: 0,
                front: {
                    "a": 9, // Aces
                    "k": 8, // Kings
                    "q": 7, // Queens
                    "j": 6, // Jacks
                    "t": 5, // Tens
                    "9": 4, // Nines
                    "8": 3, // Eights
                    "7": 2, // Sevens
                    "6": 1, // Sixes
                    "5": 0, // Fives
                    "4": 0, // Fours
                    "3": 0, // Threes
                    "2": 0  // Twos
                }
            },
            "two pairs": {
                handType: 3,
                back: 0,
                mid: 0,
                front: 0
            },
            "three of a kind": {
                handType: 4,
                back: 0,
                mid: 2,
                front: {
                    "a": 22, // Aces
                    "k": 21, // Kings
                    "q": 20, // Queens
                    "j": 19, // Jacks
                    "t": 18, // Tens
                    "9": 17, // Nines
                    "8": 16, // Eights
                    "7": 15, // Sevens
                    "6": 14, // Sixes
                    "5": 13, // Fives
                    "4": 12, // Fours
                    "3": 11, // Threes
                    "2": 10  // Twos
                }
            },
            "straight": {
                handType: 5,
                back: 2,
                mid: 4,
                front: 0
            },
            "flush": {
                handType: 6,
                back: 4,
                mid: 8,
                front: 0
            },
            "full house": {
                handType: 7,
                back: 6,
                mid: 12,
                front: 0
            },
            "four of a kind": {
                handType: 8,
                back: 10,
                mid: 20,
                front: 0
            },
            "straight flush": {
                handType: 9,
                back: 15,
                mid: 30,
                front: 0
            },
            "royal flush": {
                handType: 10,
                back: 25,
                mid: 50,
                front: 0
            }
        }
    }
};