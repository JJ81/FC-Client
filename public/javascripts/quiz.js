/**
 * Created by parkseokje
 * 퀴즈, 파이널 테스트
 * TODO
 */

'use strict';

requirejs([
    'jquery'
  ],
  function (jQuery) {

    var $ = jQuery,
        btn_play = $('.go_next'),
        btn_check_answer = $('#check_answers'),
        next_url = btn_play.parent().attr('href'),
        training_user_id = btn_play.data('training-user-id'),
        course_id = btn_play.data('course-id'),
        course_list_id = btn_play.data('course-list-id'),
        quiz_inputs = $('.answer_quiz_input'),
        quiz_options = $('.ico:not(.ico_play)');


      // jquery load event
      $(function () {
        sessionProgressStartLogger();
      });

      quiz_inputs.on('change keyup', function (e) {
        // 정답 체크 시마다 모든 문제의 정답 입력/선택 여부를 검사한다.
        validateOptionInputs();
      });

      quiz_options.click(function (e) {
        e.preventDefault();

        var element = $(this);
        
        if (element.hasClass('ico_checked')) {
          element.removeClass("ico_checked");
          element.addClass("ico_unchecked");
          element.closest("a").attr("data-value", 0);
        }  else {
          element.removeClass("ico_unchecked");
          element.addClass("ico_checked");
          element.closest("a").attr("data-value", 1);
        }

        // 정답 체크 시마다 모든 문제의 정답 입력/선택 여부를 검사한다.
        validateOptionInputs();

      });      

      // 세션 시작일시 로깅
      function sessionProgressStartLogger () {

        $.ajax({   
          type: "POST",
          url: "/api/v1/log/session/starttime",
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
          url: "/api/v1/log/session/endtime",
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

    // 정답 입력/선택여부를 체크한다.
    function validateOptionInputs () {    

      var isOk = true;

      $( ".option" ).each(function (index) {
        if ($(this).hasClass('answer_quiz_input')) {
          if ($(this).val() === '') {   
            isOk = false;         
            return false;
          }       
        } else {
          if ($(this).children().children('a').children('.ico_checked').length === 0) {
            isOk = false;         
            return false;
          }
        }
      });         

      if (isOk)
        btn_check_answer.removeClass('blind');
      else
        btn_check_answer.addClass('blind'); 

    }         

  }
);