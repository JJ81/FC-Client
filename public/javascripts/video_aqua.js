window.requirejs(
  [
    'jquery',
    'axios',
    'aquaNManagerService'
  ],
function ($, axios, AquaNManagerService) {
  var playerContainer = $('.videoplayer');

  $(function () {
    var options = {
      videoUrl: 'cdnetworks.mp4' // playerContainer.data('url')
    };
    AquaNManagerService = new AquaNManagerService(options);
    AquaNManagerService.startPlayer();
  });
});
