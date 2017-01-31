/**
 * 비디오 세션 학습 
 */

'use strict';

requirejs(
    [      
      'jquery',
	    'axios',
	    'Vimeo',    
      'jqueryTimer',
    ],
    function ($, axios, Vimeo) {
        
        var player = null,
            player_container = $('#videoplayer');

        $(function () {

          var options = {
            loop: true,
            responsive: false
          };

          player = new Vimeo('videoplayer', options);
          // player.setVolume(0);
          player.on('play', function() {
              console.log('played the video!');
          });
        });

        // player.on('loaded', function() {
        //   var frame = player_container.querySelector('iframe')
        //   if (frame !== null) {
        //     frame.style.width = '100%';
        //     frame.style.height = '100%';
        //   }
        // });

        player.ready().then(function() {
            console.info("the player is ready");
        });

    }
);
