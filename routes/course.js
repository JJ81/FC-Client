var express = require('express');
var router = express.Router();
var mysql_dbc = require('../commons/db_conn')();
var connection = mysql_dbc.init();
var QUERY = require('../database/query');
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
};
require('../commons/helpers');
var async = require('async');
var CourseService = require('../service/CourseService');

/**
 * 강의 정보
 */
router.get('/:training_user_id/:course_id', isAuthenticated, function (req, res) {		
    
  //TODO
  // 1. 마지막 course_list_id 를 조회한다.
  //    아무진행도 하지 않은 경우 course_list 의 첫번째 id 를 가져온다.
  //    알부 진행한 경우 log_edu_user_progress 에 없는 id 중 course_list 에서 order 가 가장 낮은 id 를 가져온다.

	var training_user_id = req.params.training_user_id,
      course_id = req.params.course_id,
      min_course_list_id = null; // 학습을 시작/반복/이어할 세션 id
		
		async.series([   
			function (callback) {				
				var query = connection.query(QUERY.COURSE.SEL_INDEX, [training_user_id, training_user_id, course_id], function (err, data) {
					////console.log(query.sql);
          callback(err, data[0]); // results[0]
				});
			},
			function (callback) {
				var query = connection.query(QUERY.COURSE.SEL_SESSION_LIST, [req.user.user_id, training_user_id, course_id], function (err, data) {
          console.log(query.sql);
					callback(err, data); // results[1]
				});
			},
      // edu_id, course_group_id 조회 (세션에 저장해둔다.)
			function (callback) {				
				var query = connection.query(QUERY.EDU.SEL_COURSE_GROUP, [training_user_id], function (err, data) {
          callback(err, data); // results[2]
				});
			},         
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
          min_course_list_id = results[1][0].id;
          for (var i = 0; i < results[1].length; i++) {
            if (results[1][i].done !== 1) {
              min_course_list_id = results[1][i].id;
              break;
            }
          }
        }						

				// 강의뷰 출력
				res.render('course', {
					current_path: 'course',
					current_url: req.url,
					title: global.PROJ_TITLE,
					host: req.get('origin'),
					loggedIn: req.user,
					header: results[0].course_name,
					course: results[0],
          course_list: results[1],
          course_list_id: min_course_list_id,
          training_user_id: training_user_id,
          back_url: req.user.root_path,
          edu_name: results[2][0].edu_name,
				});
			}
		});
});

/**
 * 강의 시작
 */
router.post('/log/start', isAuthenticated, function (req, res) {

  var _inputs = {
    training_user_id: req.body.training_user_id,
    course_id: req.body.course_id,
    isrepeat: req.body.isrepeat,
    user_id: req.user.user_id,
  };
  var _query = null;

  console.log(_inputs);

  connection.beginTransaction(function(err) {

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
            _inputs.training_user_id
          ], 
          function (err, data) {
            callback(err, data);
          });
      },
      // 사용자별 강의 진행정보를 입력
      function (callback) {        
        connection.query(QUERY.COURSE.INS_COURSE_PROGRESS, [
            _inputs.user_id, 
            _inputs.training_user_id, 
            _inputs.course_id,
            _inputs.training_user_id, 
            _inputs.course_id      
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
              _inputs.training_user_id, 
              _inputs.course_id,
            ], 
            function (err, data) {
              console.log(_query.sql);
              callback(err, data); 
            }
          );
        } else {
          callback(null, null);
        }
      },      
    ], function (err, results) {
      if (err) {

        // 쿼리 오류 발생
        return connection.rollback(function() {
          res.json({
            success: false,
            msg: err
          });
        });
      } else {
        connection.commit(function(err) {
          // 커밋 오류 발생
          if (err) {
            return connection.rollback(function() {
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
    training_user_id: req.body.training_user_id,
    course_id: req.body.course_id,
    course_group_id: req.body.course_group_id
  };

  var course_end_yn = null; 

  connection.beginTransaction(function(err) {

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
            inputs.training_user_id,
            inputs.course_id
          ], 
          function (err, data) {
            callback(err, data);
          }
        );
      },
      function (callback) {
        // 강의 종료여부 조회
        var query = connection.query(QUERY.COURSE.SEL_COURSE_END, [
            inputs.course_group_id,
            inputs.training_user_id
          ], 
          function (err, data) {
            if (data.length === 0) {
              course_end_yn = true;
            }              
            callback(err, data);
          }
        );
      },  
      function (callback) {
        // 교육 종료여부 기록
        if (course_end_yn) {
          var query = connection.query(QUERY.EDU.UPD_TRAINING_USER_END_DT, [
              inputs.training_user_id
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
        return connection.rollback(function() {
          res.json({
            success: false,
            msg: err
          });
        });
      } else {
        connection.commit(function(err) {
          // 커밋 오류
          if (err) {
            return connection.rollback(function() {
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