window.requirejs(
  [
    'jquery',
    'axios',
    'aquaNManagerService'
  ],
function ($, axios, AquaNManagerService) {
  var playerContainer = $('.videoplayer');
  var btnPlayVideo = $('#btn_play_video');

  // element cache
  var btnPlayNext = $('#btn_play_next');
  var nextUrl = btnPlayNext.parent().attr('href');
  var btnReplayVideo = $('#btn_replay_video');

  $(function () {
    var options = {
      videoUrl: 'cdnetworks.mp4', // playerContainer.data('url')
      trainingUserId: playerContainer.data('training-user-id'),
      courseId: playerContainer.data('course-id'),
      courseListId: playerContainer.data('course-list-id'),
      videoId: playerContainer.data('id'),
      videoStatus: playerContainer.data('status')
    };
    AquaNManagerService = new AquaNManagerService(options);

    if (playerContainer.data('confirm') == 1) {
      window.alert('hahaha you must click next button right now!');
    }
    showPlayBtn();
  });

  btnPlayVideo.on('click', function () {
    sessionProgressStartLogger();
    AquaNManagerService.startPlayer();
  });

  /**
   * 세션 시작일시 로깅
   */
  function sessionProgressStartLogger () {
    $.ajax({
      type: 'POST',
      url: '/session/log/starttime',
      data: {
        training_user_id: playerContainer.data('training-user-id'),
        course_id: playerContainer.data('course-id'),
        course_list_id: playerContainer.data('course-list-id')
      }
    }).done(function (res) {
      if (!res.success) {
        console.error(res.msg);
      }
    });
  }

  /**
  * 다음버튼 클릭 시 발생 이벤트
  */
  btnPlayNext.on('click', function (event) {
    event.preventDefault();
    // 세션 종료로그를 기록한다.
    sessionProgressEndLogger();
  });

  /**
   * 세션 종료일시 로깅
   */
  function sessionProgressEndLogger () {
    $.ajax({
      type: 'POST',
      url: '/session/log/endtime',
      data: {
        training_user_id: playerContainer.data('training-user-id'),
        course_id: playerContainer.data('course-id'),
        course_list_id: playerContainer.data('course-list-id')
      }
    }).done(function (res) {
      if (!res.success) {
        console.error(res.msg);
      } else {
        window.location.href = nextUrl;
      }
    });
  }

  /**
   * 총 릴타임의 80% 이상을 시청한 경우 다음버튼을 활성화 한다.
   */
  function showPlayBtn () {
    if (playerContainer.data('status') === 'done') {
      btnPlayNext.removeClass('blind');
      btnReplayVideo.addClass('blind');
    }
  }
});
