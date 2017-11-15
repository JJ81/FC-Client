
'use strict';

window.requirejs(
  [
    'common',
    'Vimeo'
  ],
function (Util, Vimeo) {
  var $ = $ || window.$;
  var playerAndroid;
  var playerIphone;

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
    playerAndroid = new Vimeo('videoplayer-android', options);
    playerAndroid.setVolume(0.5); // 볼륨설정
    playerAndroid.ready().then(function () {
      console.info('playerAndroid is ready.');
    }).catch(function (error) {
      console.error(error);
    });

    playerIphone = new Vimeo('videoplayer-iphone', options);
    playerIphone.setVolume(0.5); // 볼륨설정
    playerIphone.ready().then(function () {
      console.info('playerIphone is ready.');
    }).catch(function (error) {
      console.error(error);
    });
  }
});

