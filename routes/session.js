var express = require('express');
var router = express.Router();
var mysqlDbc = require('../commons/db_conn')();
var connection = mysqlDbc.init();
var QUERY = require('../database/query');
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
};
require('../commons/helpers');
var async = require('async');
var CourseService = require('../service/CourseService');
var PointService = require('../service/PointService');

/**
 * 세션 학습시작
 */
router.get('/:training_user_id/:course_id/:course_list_id', isAuthenticated, function (req, res) {
  var hostName = req.headers.host;
  var logoName = null;
  var logoImageName = null;

  logoName = hostName.split('.')[1];
  logoName = logoName === undefined ? 'orangenamu' : logoName;
  logoImageName = logoName + '.png';

  var training_user_id = req.params.training_user_id;
  var course_id = req.params.course_id;
  var course_list_id = req.params.course_list_id;
  var course_list = null;
  var session = null; // course_list 데이터 저장
  var query = null;

  async.series([
    // 강의정보 조회
    // results[0]
    function (callback) {
      connection.query(QUERY.COURSE_LIST.SEL_INDEX, [training_user_id, course_list_id], function (err, data) {
        course_list = data[0];
        console.log(course_list);
        callback(err, data);
      });
    },
    // 세션 (비디오/퀴즈/파이널테스트) 정보 조회
    // results[1]
    function (callback) {
      switch (course_list.type) {
      case 'VIDEO':
        connection.query(QUERY.COURSE_LIST.SEL_VIDEO, [course_list.video_id], function (err, data) {
          callback(err, data);
        });
        break;

      default: // QUIZ / FINAL
        connection.query(QUERY.COURSE_LIST.GetQuizDataByGroupId, [ course_list.quiz_group_id ], function (err, data) {
          callback(err, data); // results[1]
        });
        break;
      }
    },
    // (비디오 세션일 경우에만 해당) 비디오 총 시청시간 조회
    // results[2]
    function (callback) {
      if (course_list.type === 'VIDEO') {
        query = connection.query(QUERY.LOG_VIDEO.SEL_TOTAL_VIDEO_PLAYTIME, [
          req.user.user_id,
          training_user_id,
          course_list.video_id
        ], function (err, data) {
          callback(err, data);
        });
      } else {
        callback(null, null);
      }
    },
    // 비디오 마지막 재생시점을 가져온다.
    // results[3]
    function (callback) {
      if (course_list.type === 'VIDEO') {
        query = connection.query(QUERY.LOG_VIDEO.SEL_LAST_VIDEO_CURRENT_TIME, [
          req.user.user_id,
          training_user_id,
          course_list.video_id
        ], function (err, data) {
          // console.log(data);
          callback(err, data);
        });
      } else {
        callback(null, null);
      }
    }
  ],
  function (err, results) {
    if (err) {
      console.error(err);
    } else {
      // 다음으로 버튼 클릭시 이동할 페이지
      var root_path = '/' + req.path.split('/')[1],
        next_url = null;

      // 다음 URL 을 설정한다.
      if (course_list.next_id) {
        next_url = '/' + 'session' + '/' + training_user_id + '/' + course_id + '/' + course_list.next_id;
      } else {
        next_url = '/' + 'evaluate' + '/' + training_user_id + '/' + course_id;
      }

      // 비디오뷰 출력
      if (course_list.type === 'VIDEO') {
        var currenttime = 0;
        if (results[3][0] != null) { currenttime = results[3][0].currenttime; }

        res.render('video', {
          group_path: 'contents',
          current_path: 'video',
          current_url: req.url,
          title: global.PROJ_TITLE,
          logo: logoName,
          logo_image: logoImageName,
          host: req.get('origin'),
          loggedIn: req.user,
          header: course_list.title,
          content: results[1][0],
          total_played_seconds: results[2][0].total_played_seconds,
          currenttime: currenttime,
          next_url: next_url,
          training_user_id: training_user_id,
          course_id: course_id,
          course_list_id: course_list_id,
          setting: {
            interval: 5, // playtime 로깅 간격
            waiting_seconds: 30, // 비디오 종료 후 다음 버튼이 노출되는 시간
            passive_rate: 80 // 다음 버튼이 활성화되는 시청시간 (%)
          }
        });
      } else {
        var quiz_list = CourseService.makeQuizList(results[1]);
        // 퀴즈뷰 출력
        res.render('quiz', {
          group_path: 'contents',
          current_path: 'quiz',
          current_url: req.url,
          title: global.PROJ_TITLE,
          logo: logoName,
          logo_image: logoImageName,
          host: req.get('origin'),
          loggedIn: req.user,
          header: course_list.title,
          contents: quiz_list, // results[1],
          next_url: next_url,
          training_user_id: training_user_id,
          course_id: course_id,
          course_list_id: course_list_id,
          prev_yn: course_list.prev_yn,
          course_list_type: course_list.type
        });
      }
    }
  });
});

// 세션 시작일시를 기록한다.
// url: /api/v1/log/session/starttime
router.post('/log/starttime', isAuthenticated, function (req, res) {
  var inputs = {
    user_id: req.user.user_id,
    training_user_id: parseInt(req.body.training_user_id),
    course_id: parseInt(req.body.course_id),
    course_list_id: parseInt(req.body.course_list_id)
  };
  var query = null;

  async.series([
    // 로그를 조회한다.
    function (callback) {
      query = connection.query(QUERY.LOG_COURSE_LIST.SEL_SESSION_PROGRESS, [
        inputs.user_id,
        inputs.training_user_id,
        inputs.course_list_id
      ],
    function (err, data) {
      callback(err, data);
    });
    },
    function (callback) {
      query = connection.query(QUERY.LOG_COURSE_LIST.INS_SESSION_PROGRESS, [
        inputs.user_id,
        inputs.training_user_id,
        inputs.course_id,
        inputs.course_list_id,
        inputs.user_id,
        inputs.training_user_id,
        inputs.course_list_id
      ],
      function (err, data) {
        callback(err, data);
      });
    }
  ],
  function (err, results) {
    var hadEnded = false; // 세션 종료 여부
    if (results[0][0]) { hadEnded = (results[0][0].end_dt !== null); }

    if (err) {
      // 쿼리 실패
      res.json({
        success: false,
        msg: err
      });
    } else {
      // 쿼리 성공
      res.json({
        success: true,
        hasEnded: hadEnded
      });
    }
  });
});

/**
 * 세션 시작일시를 기록한다.
 * 포인트를 갱신한다. V
 */
router.post('/log/endtime', isAuthenticated, function (req, res) {
  var _inputs = {
    user_id: req.user.user_id,
    training_user_id: parseInt(req.body.training_user_id),
    course_id: parseInt(req.body.course_id),
    course_list_id: parseInt(req.body.course_list_id),
    course_list_type: req.body.course_list_type
  };

  connection.query(QUERY.LOG_COURSE_LIST.UPD_SESSION_PROGRESS, [
    _inputs.user_id,
    _inputs.training_user_id,
    _inputs.course_list_id
  ],
    function (err, data) {
      if (err) {
        // 쿼리 실패
        res.json({
          success: false,
          msg: err
        });
      } else {
        // 쿼리 성공
        PointService.save(connection,
          { user: req.user, training_user_id: _inputs.training_user_id },
          function (err, data) {
            res.json({
              success: true
            });
          }
        );
      }
    }
  );
});

// 세션 로그를 삭제한다/
router.delete('/log', isAuthenticated, function (req, res) {
  var inputs = {
    user_id: req.user.user_id,
    training_user_id: req.query.training_user_id,
    course_list_id: req.query.course_list_id
  };

  connection.query(QUERY.LOG_COURSE_LIST.DEL_SESSION_PROGRESS, [
    inputs.user_id,
    inputs.training_user_id,
    inputs.course_list_id
  ],
    function (err, data) {
      if (err) {
			// 쿼리 실패
        res.json({
          success: false,
          msg: err
        });
      } else {
			// 쿼리 성공
        res.json({
          success: true
        });
      }
    }
  );
});

module.exports = router;
