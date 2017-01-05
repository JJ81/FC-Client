/**
 * Created by parkseokje
 * 강의 정보
 */


/**
 * TODO
 * 학습하기/반복하기 버튼 클릭시 첫번째 세션부터 시작
 * 이어하기 클릭 시 마지막 세션으로 이동해야 한다.
 * 학습하기가 모두 끝난 세션을 개별적으로 학습이 가능해야 한다.
 */



requirejs([
    'jquery'
  ],
  function (jQuery) {

    'use strict';

    var $ = jQuery,
        btn_more = $('.btn_more'),
        full_desc = $('input#full_desc'), // 전체 설명
        btn_play = $('div.btn_play'); // 학습시작버튼

    // 더보기 클릭
    btn_more.bind('click', function (e) {
      e.preventDefault();

      $('.desc').text(full_desc.val());
      $('.btn_more').hide();
    });        

    // 학습하기
    btn_play.on('click', function (event) {
      event.preventDefault();

      var next_url = $(this).parent().attr('href'),
          training_user_id = $(this).data('training-user-id'),
          course_id = $(this).data('course-id');
      
      // 강의 시작로그를 기록한다.
      $.ajax({   
        type: "POST",
        url: "/api/v1/course/play",   
        data: { training_user_id: training_user_id, course_id: course_id }   
      }).done(function (res) {   
        //console.log(res.msg);
        location.href = next_url;
      });

    });

    // 비활성화된 li 클릭 시 진입차단
    // 모든 세션을 완료하기 전까지 순차적인 진행만 가능함. 즉, 학습하기 버튼 클릭을 통해서만 가능하다.
    // 개발동안 임시로 풀어둔다..
    // $('ol li').click(function(e) {
    //   if ($(this).hasClass('disabled')) {
    //     e.preventDefault();
    //     alert('아직 완료하지 않은 세션이 존재합니다. 학습(이어)하기 버튼을 눌러주세요.');         
    //   }
    // });


  }
);
