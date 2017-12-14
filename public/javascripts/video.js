/**
 * 비디오 세션 학습
 */

'use strict';

requirejs(
  [
    'common',
    'Vimeo',
    'easyTimer',
    'jqueryTimer'
  ],
function (Util, Vimeo, Timer) {
  var $ = $ || window.$;
  var player = null;
  var playerContainer = $('.videoplayer');
  var timerLoggingInterval = playerContainer.data('interval'); // log every 5 seconds
  var timerLog = null;
  var timerWait = null; // 비디오 시청 종료 후 다음 버튼을 누르도록 강요하는 타이머
  var timerLogPlayedSeconds = 0; // 시청시간(초)
  var timerWaitingSeconds = playerContainer.data('wait-seconds'); // 다음버튼을 노출하는데 까지 대기하는 시간
  var passiveRate = playerContainer.data('passive-rate'); // 다음 버튼을 노출하는 시점
  var videoDuration = null; // 비디오 러닝타임
  var waitMessage = $('#countdown .values'); // $('.wait-message');
  var sessionHasEnded = false;
  var videoCurrentTime; // 비디오 현재 시청시간

  // element cache
  var btnPlayNext = $('#btn_play_next');
  var nextUrl = btnPlayNext.parent().attr('href');
  var btnReplayVideo = $('#btn_replay_video');

  // element data
  var videoId = playerContainer.data('id'); // video 테이블의 id
  var videoTotalPlayedSeconds = playerContainer.data('total-play'); // 비디오 총 시청시간
  var videoLastPlayedTime = playerContainer.data('current-time'); // 마지막 재생시점
  var trainingUserId = btnPlayNext.data('training-user-id');
  var courseId = btnPlayNext.data('course-id');
  var courseListId = btnPlayNext.data('course-list-id');

  var secondTimer = new Timer();

/**
 * entry point
 */
  $(function () {
    initPlayer();
  });

  /**
   * Player 를 초기화 한다.
   */
  function initPlayer () {
    var options = {
      loop: false
    };
    player = new Vimeo('videoplayer', options);
    player.setVolume(0.5); // 볼륨설정
    player.ready().then(function () {
      console.info('Player is ready.');

      player.getDuration().then(function (duration) {
        // console.log('duration : ', duration);

        videoDuration = duration; // 비디오 지속시간 구하기
        setPlayer();
      }).catch(function (error) {
        console.error(error);
      });

      if (videoLastPlayedTime < videoDuration - 5) {
        if (window.confirm('마지막 재생시점으로 이동하시겠습니까?')) {
          player.setCurrentTime(videoLastPlayedTime).then(function (seconds) {
            player.pause();
          }).catch(function (error) {
            console.error(error);
          });
        }
      }
    }).catch(function (error) {
      console.error(error);
    });
  }

  /**
   * Player 를 셋팅한다.
   */
  function setPlayer () {
    if (videoDuration) {
      timerLog = $.timer(1000 * timerLoggingInterval, videoPlayTimeLogger, true);
      timerLog.stop();
      checkVideoDuration();
    } else {
      console.error('재생시간을 확인할 수 없습니다.');
    }
  }

  /**
   * 비디오 재생시간이 존재하는지 여부 체크
   */
  function checkVideoDuration () {
  // videoDuration = getPlayerDuration();
  // 총 릴타임의 80% 이상을 시청한 경우 다음버튼을 활성화 한다.
    showPlayBtn(videoTotalPlayedSeconds);
  }

  /**
   * 총 릴타임의 80% 이상을 시청한 경우 다음버튼을 활성화 한다.
   */
  function showPlayBtn (totalPlayedSeconds) {
    if (Math.floor(videoDuration * (passiveRate / 100)) <= totalPlayedSeconds) {
      btnPlayNext.removeClass('blind');
      btnReplayVideo.addClass('blind');
    }
  }

  /**
   * 시청시간 로깅
   */
  function videoPlayTimeLogger () {
    console.log('logging...');
    timerLogPlayedSeconds += timerLoggingInterval;

    player.getCurrentTime().then(function (seconds) {
      if ((videoCurrentTime > 0) && videoCurrentTime === seconds) {
        player.pause().then(function () {
          console.log('비디오가 중지되었습니다.');
          btnReplayVideo.removeClass('blind');
        }).catch(function (error) {
          console.error(error);
        });
        return;
      }
      videoCurrentTime = seconds;
      $.ajax({
        type: 'POST',
        url: '/video/log/playtime',
        data: {
          training_user_id: trainingUserId,
          video_id: videoId,
          played_seconds: timerLogPlayedSeconds,
          video_duration: videoDuration,
          currenttime: seconds
        }
      }).done(function (res) {
        if (!res.success) {
          console.error(res.msg);

          // 오류 발생 시 타이머와 비디오 재생을 멈춘다.
          player.pause().then(function () {
          }).catch(function (error) {
            console.error(error);
          });
        } else {
          timerLogPlayedSeconds = 0;
          // 총 릴타임의 80% 이상을 시청한 경우 다음버튼을 활성화 한다.
          videoTotalPlayedSeconds = res.total_played_seconds;
          showPlayBtn(videoTotalPlayedSeconds);
        }
      });
    }).catch(function (error) {
      console.error(error);
    });
  }

  /**
   * 비디오 시청 종료시간 로깅
   */
  function videoEndTimeLogger () {
    console.log('video log end');
    $.ajax({
      type: 'POST',
      url: '/video/log/endtime',
      data: {
        video_id: videoId
      }
    }).done(function (res) {
      if (!res.success) {
        console.error(res.msg);
      } else {
      // console.info('종료시간 기록!');
      }
    });
  }

  /**
   * 세션 시작일시 로깅
   */
  function sessionProgressStartLogger () {
    console.log('session log start');
    $.ajax({
      type: 'POST',
      url: '/session/log/starttime',
      data: {
        training_user_id: trainingUserId,
        course_id: courseId,
        course_list_id: courseListId
      }
    }).done(function (res) {
      if (!res.success) {
        console.error(res.msg);
      // 오류 발생 시 타이머와 비디오 재생을 멈춘다.
        timerLog.stop();
        player.stop();
      } else {
        sessionHasEnded = res.hasEnded; // 세션 종료여부
      }
    });
  }

  /**
   * 세션 종료일시 로깅
   */
  function sessionProgressEndLogger () {
    console.log('session log end');
    $.ajax({
      type: 'POST',
      url: '/session/log/endtime',
      data: {
        training_user_id: trainingUserId,
        course_id: courseId,
        course_list_id: courseListId
      }
    }).done(function (res) {
      if (!res.success) {
        console.error(res.msg);
      // 오류 발생 시 타이머와 비디오 재생을 멈춘다.
        timerLog.stop();
        player.stop();
      } else {
        // console.info('세션 종료시간 기록');
        window.location.href = nextUrl;
      }
    });
  }

  /**
   * 정해진 시간 내에 다음 버튼을 누르지 않을 경우
   * 학습을 초기화 하는 타이머 컨트롤러
   */
  function waitingTimeLogger () {
    timerWaitingSeconds -= 1;
    waitMessage.html(' ( ' + timerWaitingSeconds + ' 초 이내 클릭 )');

    // 세션과 비디오 로그를 삭제한다.
    if (timerWaitingSeconds <= 0) {
      timerWait.stop();
      window.alert('비디오를 재시청 해주시기 바랍니다.');

      axios.all([ deleteVideoLog(), deleteSessionLog() ])
        .then(axios.spread(function (res1, res2) {
          window.location.reload();
        }));
    }
  }

  /**
   * 세션 비디오 로그를 삭제한다.
   */
  function deleteVideoLog () {
    return axios.delete('/video/log', {
      params: {
        video_id: videoId
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
        training_user_id: trainingUserId,
        course_list_id: courseListId
      }
    })
    .then(function (response) {
    })
    .catch(function (error) {
      console.error(error);
    });
  }

/**
 * 다음버튼 클릭 시 발생 이벤트
 */
  btnPlayNext.on('click', function (event) {
    event.preventDefault();

    secondTimer.stop();
    // 세션 종료로그를 기록한다.
    sessionProgressEndLogger();
  });

  /**
   * Player 재생 시 발생
   */
  player.on('play', function (data) {
    // secondTimer.reset();
    // 세션시작로그
    sessionProgressStartLogger();
    // 로깅 시간간격 설정
    timerLog.reset(1000 * timerLoggingInterval);
  });

  /**
   * Player 일시정지 시 발생
   */
  player.on('error', function (data) {
    console.info('error!');
    console.error(data);
  });

  /**
   * Player 일시정지 시 발생
   */
  player.on('pause', function (data) {
    console.info('player: pause');
    // 로깅 일시정지
    timerLog.pause();
    // 비디오 시청 종료일시 기록
    videoEndTimeLogger();
  });

/**
 * Player 종료 시 발생
 */
  player.on('ended', function (data) {
    console.info('player: ended');
    // 로깅 일시정지
    timerLog.pause();
    // 총 시청시간에 따라 다음 버튼 표시
    showPlayBtn(videoTotalPlayedSeconds + timerLoggingInterval);
    // 비디오 시청 종료일시 기록
    videoEndTimeLogger();
    // 세션 종료 시 대기 타이머 시작
    if (!sessionHasEnded) {
      setTimeout(function () {
        // timerWait = $.timer(1000 * 1, waitingTimeLogger, true);

        $('.timer').removeClass('blind');

        console.log('second timer started');
        secondTimer.start({countdown: true, startValues: {seconds: 30}});

        waitMessage.html(secondTimer.getTimeValues().toString() + ' 초 이내 <b>다음</b> 버튼을 클릭해주세요.');

        secondTimer.addEventListener('secondsUpdated', function (e) {
          waitMessage.html(secondTimer.getTimeValues().toString() + ' 초 이내 <b>다음</b> 버튼을 클릭해주세요.');
        });

        secondTimer.addEventListener('targetAchieved', function (e) {
          waitMessage.html('학습 초기화 중입니다..');

          setTimeout(function () {
            window.alert('30초 동안 다음 버튼을 누르지 않아 학습을 초기화 하였습니다.\n\n재시청 해주시기 바랍니다.');

            axios.all([ deleteVideoLog(), deleteSessionLog() ])
            .then(axios.spread(function (res1, res2) {
              window.location.reload();
            }));
          }, 3000);
        });
      }, 1000);
    }
  });

  // player.on('timeupdate', function (event) {
  //   console.log(event.percent);
  // });

  btnReplayVideo.on('click', function (e) {
    e.preventDefault();
    player.unload().then(function () {
      btnReplayVideo.addClass('blind');
    }).catch(function (error) {
      console.log(error);
    });
  });
});
