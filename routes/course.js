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
// var CourseService = require('../service/CourseService');

/**
 * 강의 정보
 */
router.get('/:trainingUserId/:courseId', isAuthenticated, function (req, res) {
  var hostName = req.headers.host;
  var logoName = null;
  var logoImageName = null;

  logoName = hostName.split('.')[1];
  logoName = logoName === undefined ? 'orangenamu' : logoName;
  logoImageName = logoName + '.png';

  var trainingUserId = req.params.trainingUserId;
  var courseId = req.params.courseId;
  var minCourseListId = null; // 학습을 시작/반복/이어할 세션 id

  async.series([
    function (callback) {
      connection.query(QUERY.COURSE.SEL_INDEX, [trainingUserId, trainingUserId, courseId], function (err, data) {
        callback(err, data[0]);
      });
    },
    function (callback) {
      connection.query(QUERY.COURSE.SEL_SESSION_LIST, [req.user.user_id, trainingUserId, courseId], function (err, data) {
        callback(err, data);
      });
    },
    // edu_id, course_group_id 조회 (세션에 저장해둔다.)
    function (callback) {
      connection.query(QUERY.EDU.SEL_COURSE_GROUP, [trainingUserId], function (err, data) {
        callback(err, data);
      });
    }
  ], function (err, results) {
    if (err) {
      console.error(err);
    } else {
      console.info(results);

        // 교육과정id 와 강의그룹id 를 세션에 저장한다.
      req.user.edu_id = results[2][0].edu_id;
      req.user.course_group_id = results[2][0].course_group_id;
        // console.log(req.user.edu);

        // 학습하기 버튼 클릭 시 시작 세션 id를 구한다.
        // 기본은 id 가 가장 작은 세션이다.
        // 그 다음은 완료하지 않은 세션 중 id 가 가장 작은 세션이다.
      if (results[1].length !== 0) {
        minCourseListId = results[1][0].id;
        for (var i = 0; i < results[1].length; i++) {
          if (results[1][i].done !== 1) {
            minCourseListId = results[1][i].id;
            break;
          }
        }
      }

      // 강의뷰 출력
      res.render('course', {
        current_path: 'course',
        current_url: req.url,
        title: global.PROJ_TITLE,
        logo: logoName,
        logo_image: logoImageName,
        host: req.get('origin'),
        loggedIn: req.user,
        header: results[0].course_name,
        course: results[0],
        course_list: results[1],
        course_list_id: minCourseListId,
        training_user_id: trainingUserId,
        back_url: req.user.root_path,
        edu_name: results[2][0].edu_name
      });
    }
  });
});

/**
 * 강의 시작
 */
router.post('/log/start', isAuthenticated, function (req, res) {
  var _inputs = {
    trainingUserId: req.body.training_user_id,
    courseId: req.body.course_id,
    isrepeat: req.body.isrepeat,
    user_id: req.user.user_id
  };
  var _query = null;

  console.log(_inputs);

  connection.beginTransaction(function (err) {
    // 트렌젝션 오류 발생
    if (err) {
      return res.json({
        success: false,
        msg: err
      });
    }

    // async.series 쿼리 시작
    async.series([

      // 최초 학습시작 시 training_users 의 시작일시(start_dt)를 기록
      function (callback) {
        connection.query(QUERY.EDU.UPD_TRAINING_USER_START_DT, [
          _inputs.trainingUserId
        ],
          function (err, data) {
            callback(err, data);
          });
      },
      // 사용자별 강의 진행정보를 입력
      function (callback) {
        connection.query(QUERY.COURSE.INS_COURSE_PROGRESS, [
          _inputs.user_id,
          _inputs.trainingUserId,
          _inputs.courseId,
          _inputs.trainingUserId,
          _inputs.courseId
        ],
          function (err, data) {
            callback(err, data);
          }
        );
      },
      // 사용자별 강의 반복횟수 갱신
      function (callback) {
        if (_inputs.isrepeat) {
          _query = connection.query(QUERY.COURSE.UPD_COURSE_PROGRESS_REPEAT, [
            _inputs.trainingUserId,
            _inputs.courseId
          ],
            function (err, data) {
              console.log(_query.sql);
              callback(err, data);
            }
          );
        } else {
          callback(null, null);
        }
      }
    ], function (err, results) {
      if (err) {
        // 쿼리 오류 발생
        return connection.rollback(function () {
          res.json({
            success: false,
            msg: err
          });
        });
      } else {
        connection.commit(function (err) {
          // 커밋 오류 발생
          if (err) {
            return connection.rollback(function () {
              res.json({
                success: false,
                msg: err
              });
            });
          }

          // 커밋 성공
          res.json({
            success: true
          });
        });
      }
    });
  });
});

/**
 * 강의 종료
 * 1. 강의 종료일시 기록
 * 2. 강의 종료여부 조회
 * 3. 교육 종료여부 기록
 * 4. 교육이수여부, 교육과정 이수속도를 포인트 결과에 반영
 */
router.post('/log/end', isAuthenticated, function (req, res) {
  var inputs = {
    trainingUserId: req.body.training_user_id,
    courseId: req.body.course_id,
    courseGroupId: req.body.course_group_id
  };

  var courseEndYn = null;

  connection.beginTransaction(function (err) {
    // 트렌젝션 오류 발생
    if (err) {
      return res.json({
        success: false,
        msg: err
      });
    }

    // async.series 쿼리 시작
    async.series([
      function (callback) {
        // 강의 종료일시 기록
        connection.query(QUERY.COURSE.UPD_COURSE_PROGRESS, [
          inputs.trainingUserId,
          inputs.courseId
        ],
          function (err, data) {
            callback(err, data);
          }
        );
      },
      function (callback) {
        // 강의 종료여부 조회
        connection.query(QUERY.COURSE.SEL_COURSE_END, [
          inputs.courseGroupId,
          inputs.trainingUserId
        ],
          function (err, data) {
            if (data.length === 0) {
              courseEndYn = true;
            }
            callback(err, data);
          }
        );
      },
      function (callback) {
        // 교육 종료여부 기록
        if (courseEndYn) {
          connection.query(QUERY.EDU.UPD_TRAINING_USER_END_DT, [
            inputs.trainingUserId
          ],
            function (err, data) {
              // console.log(query.sql);
              callback(err, data);
            }
          );
        } else {
          callback(null, null);
        }
      }
    ], function (err, results) {
      if (err) {
        // 쿼리 오류 발생
        return connection.rollback(function () {
          res.json({
            success: false,
            msg: err
          });
        });
      } else {
        connection.commit(function (err) {
          // 커밋 오류
          if (err) {
            return connection.rollback(function () {
              res.json({
                success: false,
                msg: err
              });
            });
          }

          res.json({
            success: true
          });
        });
      }
    });
  });
});

module.exports = router;
