window.requirejs(
  [
    'common',
    'aquaPlayerService',
    'easyTimer',
    'text!/win_aquaplayer_html5.html',
    'text!/win_aquaplayer_window.html',
    'jqueryTimer'
  ],
function (Util, AquaPlayerService, Timer, templateHTML5, templateWindow) {
  var $ = $ || window.$;
  var axios = axios || window.axios;
  var osName = Util.getOSName();

  var player = null;
  var playerContainer = $('.videoplayer');
  // var aquaHtml5 = $('#aqua-html5');
  // var aquaWindow = $('#aqua-window');
  var btnPlayNext = $('#btn_play_next');
  var btnReplayVideo = $('#btn_replay_video');

  var timerLoggingInterval = playerContainer.data('interval'); // log every 5 seconds
  var timerLog = null;
  var timerLogPlayedSeconds = 0; // 시청시간(초)
  var secondTimer = new Timer();

  var waitMessage = $('#countdown .values'); // $('.wait-message');
  var passiveRate = playerContainer.data('passive-rate'); // 다음 버튼을 노출하는 시점
  var sessionHasEnded = false;
  var nextUrl = btnPlayNext.parent().attr('href');
  var videoDuration = null; // 비디오 러닝타임
  var videoCurrentTime; // 비디오 현재 시청시간
  var videoId = playerContainer.data('id'); // video 테이블의 id
  var videoTotalPlayedSeconds = playerContainer.data('total-play'); // 비디오 총 시청시간
  // var videoLastPlayedTime = playerContainer.data('current-time'); // 마지막 재생시점
  var trainingUserId = btnPlayNext.data('training-user-id');

  function logger (message) {
    // debuggin 목적으로만 활성화할 것!
    // console.log('video_aqua_pc :', message);
  }

  $(function () {
    var data = {
      video_url: playerContainer.data('video-url'),
      watermark: playerContainer.data('watermark')
    };

    var content;

    if (osName === 'Windows') {
      logger('window');
      content = window.Handlebars.compile(templateHTML5);
    } else {
      logger('html5');
      content = window.Handlebars.compile(templateHTML5);
    }

    // console.log(content(data));

    $('#aqua-player').append(content(data));

    var options = {
      // fileUrl: $('#video').data('url'),
      // watermark: $('#video').data('watermark'),
      fileUrl: data.video_url,
      watermark: data.watermark,
      callback: function (obj) {
        if (obj) {
          player = obj;
          initPlayer();
        }
      }
    };
    AquaPlayerService = new AquaPlayerService(options);
  });

  function initPlayer () {
    console.log('initPlayer');
    player.setVolume(0.5);

    player.bindEvent('Error', function (ec, msg) {
      logger('player:Error ' + msg);
      console.error(msg);
    });

    player.bindEvent('OpenStateChanged', function (state) {
      logger('player:OpenStateChanged');
      switch (state) {
      case window.NPlayer.OpenState.Opened:
        logger('player:OpenStateChanged:Opened');

        videoDuration = player.getDuration();

        // if (videoLastPlayedTime < videoDuration - 5) {
        //   if (window.confirm('마지막 재생시점으로 이동하시겠습니까?')) {
        //     player.setCurrentPlaybackTime(videoLastPlayedTime);
        //     // player.pause();
        //   }
        // }

        setPlayer();
        break;

      case window.NPlayer.OpenState.Closed:
        logger('player:OpenStateChanged:Closed');
        break;
      }
    });

    player.bindEvent('PlayStateChanged', function (state) {
      logger('player:PlayStateChanged');
      switch (state) {
      case window.NPlayer.PlayState.Playing:
        logger('player:PlayStateChanged:Playing');
        // 세션시작로그
        sessionProgressStartLogger();

        // 로깅 시간간격 설정
        if (timerLog) {
          timerLog.reset(1000 * timerLoggingInterval);
        }
        break;

      case window.NPlayer.PlayState.Stopped: // 정지
      case window.NPlayer.PlayState.Paused:  // 일시정지
        logger('player:PlayStateChanged:Stopped/Paused');

        // 로깅 일시정지
        timerLog.pause();

        // 비디오 시청 종료일시 기록
        videoEndTimeLogger();
        break;
      }
    });

    player.bindEvent('PlaybackCompleted', function () {
      logger('player:PlaybackCompleted');

      // 로깅 일시정지
      timerLog.pause();

      // 총 시청시간에 따라 다음 버튼 표시
      showPlayBtn(videoTotalPlayedSeconds + timerLoggingInterval);

      // 비디오 시청 종료일시 기록
      videoEndTimeLogger();

      // 세션 종료 시 대기 타이머 시작
      if (!sessionHasEnded) {
        setTimeout(function () {
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
      console.error('을 확인할 수 없습니다.');
    }
  }

  /**
   * 비디오 재생시간이 존재하는지 여부 체크
   */
  function checkVideoDuration () {
    // 총 릴타임의 80% 이상을 시청한 경우 다음버튼을 활성화 한다.
    showPlayBtn(videoTotalPlayedSeconds);
  }

    /**
   * 시청시간 로깅
   */
  function videoPlayTimeLogger () {
    // console.log('video played time logging...');
    timerLogPlayedSeconds += timerLoggingInterval;

    var seconds = player.getCurrentPlaybackTime();

    if ((videoCurrentTime > 0) && videoCurrentTime === seconds) {
      player.pause();
      btnReplayVideo.removeClass('blind');
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
  }

  /**
   * 비디오 시청 종료시간 로깅
   */
  function videoEndTimeLogger () {
    logger('videoEndTimeLogger');

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
    logger('sessionProgressStartLogger');
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
        // 오류 발생 시 타이머와 비디오 재생을 멈춘다.
        timerLog.stop();
        player.stop();
      } else {
        sessionHasEnded = res.hasEnded; // 세션 종료여부
      }
    });
  }

/**
 * 다음버튼 클릭 시 발생 이벤트
 */
  btnPlayNext.on('click', function (event) {
    logger('btnPlayNext:click');
    event.preventDefault();
    secondTimer.stop();
    // 세션 종료로그를 기록한다.
    sessionProgressEndLogger();
  });

  /**
   * 세션 종료일시 로깅
   */
  function sessionProgressEndLogger () {
    logger('sessionProgressEndLogger');
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
    logger('showPlayBtn');
    logger('videoDuration:' + videoDuration);
    logger('passiveRate:' + passiveRate);
    logger('videoTotalPlayedSeconds:' + videoTotalPlayedSeconds);

    if (Math.floor(videoDuration * (passiveRate / 100)) <= videoTotalPlayedSeconds) {
      btnPlayNext.removeClass('blind');
      btnReplayVideo.addClass('blind');
    }
  }

  /**
   * 세션 비디오 로그를 삭제한다.
   */
  function deleteVideoLog () {
    logger('deleteVideoLog');
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
    logger('deleteSessionLog');
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

  btnReplayVideo.on('click', function (e) {
    e.preventDefault();

    player.play();
    btnReplayVideo.addClass('blind');
  });
});
