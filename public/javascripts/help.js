'use strict';

window.requirejs([
  'common',
  'aquaPlayerService'
], function (Util, AquaPlayerService) {
  var $ = $ || window.$;
  var aquaHtml5 = $('#aqua_html5');
  var aquaWindow = $('#aqua_window');
  var player;

  $(function () {
    var os = Util.getOSName;

    if (os === 'Windows') {
      aquaWindow.show();
    } else {
      aquaHtml5.show();
    }

    var options = {
      fileUrl: $('#video').data('url'),
      watermark: $('#video').data('watermark'),
      callback: function (obj) {
        if (obj) {
          player = obj;
          player.setVolume(0.5);
        }
      }
    };
    AquaPlayerService = new AquaPlayerService(options);
  });
});
