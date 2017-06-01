
'use strict';

window.requirejs(
  [
    'jquery',
    'Vimeo'
  ],
function ($, Vimeo) {
  var player;

  $(function () {
    initPlayer();
  });

  /**
   * Player 를 초기화 한다.
   */
  function initPlayer () {
    var options = {
      loop: false
    };
    player = new Vimeo('videoplayer', options);
    player.setVolume(0.5); // 볼륨설정
    player.ready().then(function () {
      console.info('Player is ready.');
    }).catch(function (error) {
      console.error(error);
    });
  }
});

