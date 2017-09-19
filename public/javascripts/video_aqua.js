window.requirejs(
  [
    'jquery',
    'axios',
    'aquaNManagerService',
    'easyTimer',
    'jqueryTimer'
  ],
function ($, axios, AquaNManagerService, Timer) {
  // element cache
  var playerContainer = $('.videoplayer');
  var btnPlayVideo = $('#btn_play_video');
  var btnPlayNext = $('#btn_play_next');
  var nextUrl = btnPlayNext.parent().attr('href');
  var btnReplayVideo = $('#btn_replay_video');
  var waitMessage = $('.countdown .values'); // $('.wait-message');

  // var timerWait = null; // 비디오 시청 종료 후 다음 버튼을 누르도록 강요하는 타이머
  // var timerWaitingSeconds = playerContainer.data('wait-seconds'); // 다음버튼을 노출하는데 까지 대기하는 시간

  $(function () {
    var options = {
      videoUrl: 'cdnetworks.mp4', // playerContainer.data('url')
      trainingUserId: playerContainer.data('training-user-id'),
      courseId: playerContainer.data('course-id'),
      courseListId: playerContainer.data('course-list-id'),
      videoId: playerContainer.data('id'),
      videoStatus: playerContainer.data('status'),
      totalPlayedSeconds: playerContainer.data('total-play')
    };
    AquaNManagerService = new AquaNManagerService(options);

    if (playerContainer.data('confirm') == '1') {
      setTimeout(function () {
        // timerWait = $.timer(1000 * 1, waitingTimeLogger, true);
        var timer = new Timer();
        timer.start({countdown: true, startValues: {seconds: 30}});

        waitMessage.html(timer.getTimeValues().toString());

        timer.addEventListener('secondsUpdated', function (e) {
          waitMessage.html(timer.getTimeValues().toString());
        });

        timer.addEventListener('targetAchieved', function (e) {
          waitMessage.html('학습 초기화 중입니다..');

          setTimeout(function () {
            window.alert('뚜둥!');
          }, 3000);
        });
      }, 1000);
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

  /**
   * 정해진 시간 내에 다음 버튼을 누르지 않을 경우
   * 학습을 초기화 하는 타이머 컨트롤러
   */
  function waitingTimeLogger () {
    waitMessage.html(' ( ' + timerWaitingSeconds + ' 초 이내 클릭 )');

    // 세션과 비디오 로그를 삭제한다.
    if (timerWaitingSeconds <= 0) {
      timerWait.stop();
      window.alert('비디오를 재시청 해주시기 바랍니다.');

      axios.all([ deleteVideoLog(), deleteSessionLog() ])
        .then(axios.spread(function (acct, perms) {
          console.log(acct);
          // if (acct.data.success) {
          var redirectUrl = '/session' +
              '/' + playerContainer.data('training-user-id') +
              '/' + playerContainer.data('course-id') +
              '/' + playerContainer.data('course-list-id');

          console.log(redirectUrl);
          window.location.href = redirectUrl;
          // }
        }));
    }

    timerWaitingSeconds -= 1;
  }

  /**
   * 세션 비디오 로그를 삭제한다.
   */
  function deleteVideoLog () {
    return axios.delete('/video/log', {
      params: {
        video_id: playerContainer.data('id')
      }
    })
    .then(function (response) {
    })
    .catch(function (error) {
      console.error(error);
    });
  }

  // 세션 로그를 삭제한다.
  function deleteSessionLog () {
    return axios.delete('/session/log', {
      params: {
        training_user_id: playerContainer.data('training-user-id'),
        course_list_id: playerContainer.data('course-list-id')
      }
    })
    .then(function (response) {
    })
    .catch(function (error) {
      console.error(error);
    });
  }
});
