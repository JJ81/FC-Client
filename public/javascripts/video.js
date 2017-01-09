/**
 * Created by parkseokje
 * 비디오 세션 학습
 * TODO
 * 1. vimeo 가 동작하지 않는다. requirejs 를 제거하면 비정상적이긴 하지만 동작한다. 이부분에 대해 추후 검토가 필요하다. (2017-01-04) 
 */

'use strict';

requirejs(
    [
      'plyr',
      'jquery',      
      'jqueryTimer',
    ],
    function (plyr, jQuery) {
      var $ = jQuery,
          timer_logging_interval = 0, // log every 5 seconds
          timer = null,
          timer_played_seconds = 0,
          player_options = {
            autoplay: false,
            debug: false
          },          
          player = plyr.setup($('.js-player'), player_options),
          btn_play = $('.btn_play'),
          video = $('.plyr__video-wrapper')[0],          
          video_container = $('.video_section'),
          video_item = $('.tmp_video'),
          video_id = video_item.data('id'), // video 테이블의 id
          video_total_played_seconds = video_item.data('total-play'), // 비디오 총 시청시간
          next_url = btn_play.parent().attr('href'),
          training_user_id = btn_play.data('training-user-id'),
          course_id = btn_play.data('course-id'),
          course_list_id = btn_play.data('course-list-id'),
          video_duration = null; // 비디오 러닝타임  

      $(function () {
        getVideoSettings();
      });
      
      // 비디오 셋팅값을 조회한다.
      function getVideoSettings() {
        $.get("/video/settings", function(res) {
          timer_logging_interval = res.interval;
          timer = $.timer(1000 * timer_logging_interval, playTimeLogger, true);
        });        
      }

      // plyr [ready] event
      video.addEventListener('ready', function(event) {

        // 새로고침을 해도 타이머가 리셋되지 않는다.
        // 임시방편으로 정지시킴
        timer.stop();
        setVideoPosY();

        // 비디오 러닝타임을 체크한다.
        checkVideoDuration(event.type);

      });

      // plyr [play] event
      video.addEventListener('play', function(event) {
        
        // 세션시작로그
        sessionProgressStartLogger();

        // 비디오 러닝타임을 체크한다.
        checkVideoDuration(event.type);

        // 타이머를 설정한다.
        timer.reset(1000 * timer_logging_interval);

      });        

      // plyr [pause] event
      video.addEventListener('pause', function() {
        
        console.info('video has paused');        
        timer.pause();
        endTimeLogger();
      });

      // plyr [timeupdate] event
      video.addEventListener('timeupdate', function() {
        //console.log('timeupdate');
      });                

      // plyr [ended] event
      video.addEventListener('ended', function() {
        console.log('ended');
        timer.stop();

        showPlayBtn (video_total_played_seconds + timer_logging_interval);
        endTimeLogger();
      });

      // 시청시간 로깅
      function playTimeLogger () {

        timer_played_seconds += timer_logging_interval;

        $.ajax({   
          type: "POST",
          url: "/video/log/playtime",   
          data: { video_id: video_id, timer_played_seconds: timer_played_seconds }   
        }).done(function (res) { 
          if (!res.success) {
            console.error(res.msg);

            // 오류 발생 시 타이머와 비디오 재생을 멈춘다.
            timer.stop();
            video.plyr.stop();
          } else {
            console.info('logged (duration : ' + video_duration + ' / total played seconds : ' + res.total_played_seconds + ')');
            timer_played_seconds = 0;

            // 총 릴타임의 80% 이상을 시청한 경우 다음버튼을 활성화 한다.
            video_total_played_seconds = res.total_played_seconds;
            showPlayBtn (video_total_played_seconds);
          } 
        });

      }
      
      // 세션 시작일시 로깅
      function sessionProgressStartLogger () {

        $.ajax({   
          type: "POST",
          url: "/session/log/starttime",
          data: { training_user_id: training_user_id, course_id: course_id, course_list_id: course_list_id }   
        }).done(function (res) { 
          if (!res.success) {
            console.error(res.msg);
            // 오류 발생 시 타이머와 비디오 재생을 멈춘다.
            timer.stop();
            video.plyr.stop();            
          } else {
            console.info('세션 시작시간 기록');
          } 
        });

      }
      
      // 세션 종료일시 로깅
      function sessionProgressEndLogger () {

        $.ajax({   
          type: "POST",
          url: "/session/log/endtime",
          data: { training_user_id: training_user_id, course_id: course_id, course_list_id: course_list_id }
        }).done(function (res) { 
          if (!res.success) {
            console.error(res.msg);
            // 오류 발생 시 타이머와 비디오 재생을 멈춘다.
            timer.stop();
            video.plyr.stop();                
          } else {
            console.info('세션 종료시간 기록');
            location.href = next_url;
          } 
        });

      }      

      // 비디오 시청 종료시간 로깅
      function endTimeLogger () {

        $.ajax({   
          type: "POST",
          url: "/video/log/endtime",   
          data: { video_id: video_id }   
        }).done(function (res) { 
          if (!res.success) {
            console.error(res.msg);
          } else {
            console.info('종료시간 기록!');
          } 
        });
        
      }      

      // 비디오 재생시간이 존재하는지 여부 체크
      function checkVideoDuration (event_name) {
        
        video_duration = video.plyr.getDuration();

        if (video_duration)
          console.info('[' + event_name + '] duration : ' + video_duration);
        else 
          console.info('[' + event_name + '] duration doesn\'t exists');
        
        // 총 릴타임의 80% 이상을 시청한 경우 다음버튼을 활성화 한다.
        showPlayBtn (video_total_played_seconds);
      }

      // 총 릴타임의 80% 이상을 시청한 경우 다음버튼을 활성화 한다.
      function showPlayBtn (total_played_seconds) {
          if (Math.floor(video_duration * 0.8) <= total_played_seconds) {
            btn_play.removeClass('blind');
          }
      }

      $(window).bind('resize', function () {
        console.info('video has resized.');
        setVideoPosY();
      });

      // 비디오 수직위치를 지정한다.
      function setVideoPosY () {
        var img_height = getVideoItemHeight(video_item);
        video_item.css('margin-top', '-' + img_height/2 + 'px');
        video_container.css('height', img_height + 'px');
        video_item.removeClass('blind');

      }    

      // 비디오 높이를 구한다.
      function getVideoItemHeight (el) {
        return Math.floor(el.height());
      }        

    // 다음으로
    btn_play.on('click', function (event) {
      event.preventDefault();

      // 세션 종료로그를 기록한다.
      sessionProgressEndLogger();
      
    });      
    
    }
);
