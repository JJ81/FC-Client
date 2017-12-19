'use strict';

window.requirejs([
  'common',
  'aquaPlayerService',
  'aquaNManagerService'
], function (Util, AquaPlayerService, AquaNManagerService) {
  var $ = $ || window.$;
  var aquaHtml5 = $('#aqua_html5');
  var aquaWindow = $('#aqua_window');
  var deviceType = $('.content-inside').data('device');
  var player;
  var btnPlayVideo = $('#btn_play_video');

  $(function () {
    var os = Util.getOSName;
    var options = {};

    if (deviceType === 'DESKTOP') {
      if (os === 'Windows') {
        aquaWindow.show();
      } else {
        aquaHtml5.show();
      }

      options.fileUrl = $('#video').data('url');
      options.watermark = $('#video').data('watermark');
      options.callback = function (obj) {
        if (obj) {
          player = obj;
          player.setVolume(0.5);
        }
      };

      AquaPlayerService = new AquaPlayerService(options);
    } else {
      options.videoUrl = $('.content-inside').data('url');
      options.returnUrl = window.location.href;

      AquaNManagerService = new AquaNManagerService(options);
    }
  });

  btnPlayVideo.on('click', function () {
    AquaNManagerService.startBasePlayer();
  });
});
