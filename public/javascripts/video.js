/**
 * Created by parkseokje
 * 비디오 세션 학습
 * TODO
 * 1. vimeo 가 동작하지 않는다. requirejs 를 제거하면 비정상적이긴 하지만 동작한다. 이부분에 대해 추후 검토가 필요하다. (2017-01-04)
 * 2. 영상이 재생이 시작될때마다, log_user_video 에 insert
 * 3. 영상이 종료될 때마다, log_user_video 에 update
 * 4. log_user_video 의 재생시간(end_dt - start_dt)을 합한 시간의 duration 의 80% 이하일 경우 다음버튼을 비활성화 한다.
 * 5. 모바일에서 plyr 의 duration, currenttime 이 넘어오는지 체크. 넘어오지 않을 경우 timeupdate 이벤트로부터 획득해야 한다. 
 */

'use strict';

requirejs(
    [
      'jquery',
      'plyr'
    ],
    function (jQuery, plyr) {
        var $ = jQuery,
            player_options = {
              autoplay: false,
              debug: false
            },
            player = plyr.setup($('.js-player'), player_options),
            video = $('.plyr__video-wrapper')[0];
        

        // plyr [ready] event
        video.addEventListener('ready', function(event) {
        
        });

        // plyr [play] event
        video.addEventListener('play', function(event) {
          
        });        

        // plyr [pause] event
        video.addEventListener('pause', function() {
          
        });

        // plyr [timeupdate] event
        video.addEventListener('timeupdate', function() {
          
        });                

        // plyr [ended] event
        video.addEventListener('ended', function() {
          
        });
        
        function getWindowheight() {
          return $(window).innerHeight();
        }

        function getImageHeight(el){
          return Math.floor(el.height());
        }

        function adjustElementPosY(){
          var el_video = $('.tmp_video');
          var img_height = getImageHeight(el_video);
          el_video.css('margin-top', '-' + img_height/2 + 'px');
          $('.video_section').css('height', img_height + 'px');
          el_video.removeClass('blind');				
        }

        // jQuery DOM ready
        $(function() {  
          adjustElementPosY();
        });

        // requirejs 내에서는 동작하지 않음, jquery dom ready 에서 대신 하도록 변경
        $(window).bind('load', function () {
          //console.log('load');
          adjustElementPosY();            
        });

        $(window).bind('resize', function () {
          console.log('resize');
          adjustElementPosY();            
        });
    }
);
