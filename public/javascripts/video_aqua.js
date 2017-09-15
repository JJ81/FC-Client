window.requirejs(
  [
    'jquery',
    'axios',
    'aquaNManagerService'
  ],
function ($, axios, AquaNManagerService) {
  var playerContainer = $('.videoplayer');
  var btnPlayVideo = $('#btn_play_video');

  $(function () {
    var options = {
      videoUrl: 'cdnetworks.mp4' // playerContainer.data('url')
    };
    AquaNManagerService = new AquaNManagerService(options);
  });

  btnPlayVideo.on('click', function () {
    AquaNManagerService.startPlayer();
  });
});
