var fire;

var gamesModel = {
  gameList: ko.observableArray(),
  game: ko.observable({})
};

/* Current Game */
var currentGame = {};

/* My username */
var username;


//initialize
$(function () {

  //get Auth token
  $.getJSON(server + '/getFireBase', function (resp) {
    if (resp.username && resp.root && resp.token) {
      fire = new Firebase(resp.root);
      fire.auth(resp.token, function (err) {
        if (err) {
          //handle auth failure
          console.error('Authentication with Firebase failed');
        } else {
          //start the app!
          username = resp.username;
          startApp();
        }
      });
    } else {
      //handle node failure
      console.error('getFireBase node response failure');
    }
  });


});

/* start the App with a firebase connection */
function startApp() {
  var games = fire.child('games');
  games.on('value', GameFunc.updateGameList);

  //apply knockout bindings
  ko.applyBindings(gamesModel);

  //subscribe to the local model, update local game
  gamesModel.game.subscribe(GameFunc.gameParse);

  /* attach on-ready handlers */

  // Create Game Button
  $('#btn_createGame').on('click', function (ev) {
    ev.preventDefault();
    var gameInput = $('#txt_createGame');
    GameFunc.createGame(gameInput.val());
    gameInput.val('');
  });
  //Join Game Button
  $('#btn_joinGame').on('click', function (ev) {
    ev.preventDefault();
    GameFunc.joinGame($('#gameList option:selected')[0].getAttribute('data-gameId'));
  });

  //Logout Button
  $('#btn_logout').text('Logout [ ' + username + ' ]').on('click', function (ev) {
    ev.preventDefault();
    $.getJSON(server + '/logout', function (resp) {
      if (resp.logout) {
        location.reload(true);
      } else {
        console.error('Logout Failed: ' + resp);
      }
    });
  });


  //reveal board
  $('#div_game').show();
}

//set rainbow blinky text! :D
function initBlinker(text) {
  $('.rainbow-blinky').each(function () {
    clearTimeout($(this).data('blinker'));
    var colourMap = ['blink_green', 'blink_red', 'blink_yellow', 'blink_blue', 'blink_orange', 'blink_purple'];
    var $ele = $(this);
    var incr = 0;
    $ele.data('blinker', setInterval(function () {
      incr++;
      if (incr >= colourMap.length) {
        incr = 0;
      }
      $ele.html('<span class="'+colourMap[incr]+'">'+text[0].data+'</span>');
    }, 100));
  });
}

//format the board
function formatPlayer(data) {

  var player = _.find(data, function (ele) {
    return $(ele).hasClass('div_player');
  }), board;

  if (player) {
    board = $(player).find('.board');
  }
  //if game is loaded
  if (currentGame.game && board) {
    var front = $(board).find('.frontRow')
      , mid = $(board).find('.midRow')
      , back = $(board).find('.backRow')
      , unplayed = $(board).find('.unplayed');

    var populateCards = function (pair) {

      var row = pair[0], size = pair[1]
        , rowData = row.text().split(','),
        cardCount = 0;

      row.empty();

      rowData.forEach(function (card) {
        if (card.length === 2) {
          var cardEle = $(Util.cardHTML(card));
          cardEle.attr('data-card', card);
          cardCount++;
          //set to draggable if unplayed and your hand
          if (row.hasClass('unplayed') && row.attr('data-username') === username) {
            cardEle.prop('draggable', true);
            cardEle.attr('ondragstart', 'dragCard(event)');
            cardEle.addClass('playable');
          } else if (row.hasClass('unplayed')) {
            //hide unplayed if not yours
            cardEle = $(Util.cardHTML('back'));
            cardEle.prop('draggable', false);
          }
          row.append(cardEle);
        }
      });
      var buffer = size - cardCount;

      for (var i = 0; i < buffer; i++) {
        var cardEle = $(Util.cardHTML());
        cardEle.attr('ondrop', 'dropCard(event)');
        cardEle.attr('ondragover', 'dragOver(event)');
        cardEle.attr('ondragleave', 'dragLeave(event)');
        cardEle.attr('data-card', 'empty');
        row.append(cardEle);
      }
    };

    Array.prototype.forEach.call([
      [front, currentGame.game.rules.game.playerRules.rows.frontRow],
      [mid, currentGame.game.rules.game.playerRules.rows.midRow],
      [back, currentGame.game.rules.game.playerRules.rows.backRow],
      [unplayed, 0]
    ], populateCards);

  }
}

//on card drop (after drag)
function dropCard(ev) {
  var $row = $(ev.target).parent()
    , rowNum, row
    , card = ev.dataTransfer.getData("card");

  if ($row.hasClass('frontRow')) {
    row = 'frontRow';
    rowNum = 2;
  } else if ($row.hasClass('midRow')) {
    row = 'frontRow';
    rowNum = 1;
  } else {
    row = 'frontRow';
    rowNum = 0;
  }

  /* Play the card */
  var player = currentGame.game.getPlayer(username);
  player.playCard(rowNum, card);

  /* Attempt to end the turn (will not succeed if turn is not complete) */
  currentGame.game.endTurn();

  /* sync the game */
  GameFunc.gameSync();

}
function dragOver(ev) {
  $(ev.target).parent().addClass('dragover');
  $(ev.target).parent().children().addClass('dragover');
  ev.preventDefault();
}
function dragLeave(ev) {
  $(ev.target).parent().removeClass('dragover');
  $(ev.target).parent().children().removeClass('dragover');

  ev.preventDefault();
}

function dragCard(ev) {
  ev.dataTransfer.setData("card", ev.target.getAttribute('data-card'));
}

function startGame() {
  currentGame.game.startGame();
  currentGame.game.deal();
  GameFunc.gameSync();
}

function leave() {
  currentGame.game.removePlayer(username);
  GameFunc.gameSync();
  GameFunc.leaveGame();
}

function addAi() {
  currentGame.game.addPlayer('ai','ai');
  GameFunc.gameSync();
}

function playAi() {
  currentGame.game.aiTurn();
}
