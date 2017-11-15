/**
 * Created by parkseokje
 * 강의 정보
 */

/**
 * TODO
 * 세션을 모두 완료하지 않은 상태에서 개별 세션 학습을 진행할 수 없도록 한다. V
 * 학습하기/반복하기 버튼 클릭시 첫번째 세션부터 시작 V
 * 이어하기 클릭 시 미완료 세션중 첫번 째로 이동해야 한다. V
 * 학습하기가 모두 끝난 세션을 개별적으로 학습이 가능해야 한다. V
 * 최초 학습시작 버튼 클릭시 training_users 의 start_dt 를 기록해야 한다.
 */

requirejs([
  'common'
],
  function (Util) {
    'use strict';

    var $ = $ || window.$;
    var btn_more = $('.btn_more');
    var full_desc = $('#full_desc'); // 전체 설명
    var btn_play = $('#btn_play_next'); // 학습시작버튼

    // 더보기 클릭
    btn_more.bind('click', function (e) {
      e.preventDefault();

      $('.desc').html(full_desc.html());
      $('.btn_more').hide();
    });

    // 학습하기
    btn_play.on('click', function (event) {
      event.preventDefault();

      var next_url = $(this).attr('href');
      var training_user_id = $(this).data('training-user-id');
      var course_id = $(this).data('course-id');
      var isrepeat = $(this).children('.btn_play').children('span').hasClass('repeat');

      // 강의 시작로그를 기록한다.
      $.ajax({
        type: 'POST',
        url: '/course/log/start',
        data: {
          training_user_id: training_user_id,
          course_id: course_id,
          isrepeat: isrepeat
        }
      }).done(function (res) {
        // console.log(res.msg);
        location.href = next_url;
      });
    });

    // 비활성화된 li 클릭 시 진입차단
    // 모든 세션을 완료하기 전까지 순차적인 진행만 가능함. 즉, 학습하기 버튼 클릭을 통해서만 가능하다.
    // 개발동안 임시로 풀어둔다..
    $('ol li').click(function (e) {
      if ($(this).hasClass('disabled')) {
        e.preventDefault();
        alert('학습하기 버튼을 클릭하세요.');
        // alert('아직 완료하지 않은 세션이 존재합니다. 학습(이어)하기 버튼을 눌러주세요.');
      }
    });
  }
);
