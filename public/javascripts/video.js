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
          };

          player = new Vimeo('videoplayer', options);
          // player.setVolume(0);
          player.on('play', function() {
              console.log('played the video!');
          });

        }); // $(function
    } 
    
    
);
