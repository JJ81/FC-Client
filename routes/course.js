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
				var query = connection.query(QUERY.COURSE.SEL_SESSION_LIST, [training_user_id, course_id], function (err, data) {
          //////console.log(query.sql);
					callback(err, data); // results[1]
				});
			}
		], function (err, results) {
			if (err) {
				//console.error(err);
			} else {
				//console.info(results);

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
          training_user_id: training_user_id
				});									
			}
		});
});

/**
 * 강의 시작
 */
router.post('/log/start', function (req, res) {

  var inputs = {
    training_user_id: req.body.training_user_id,
    course_id: req.body.course_id
  };      

  connection.beginTransaction(function(err) {

    // 트렌젝션 오류 발생
    if (err) { 
      res.json({
        success: false,
        msg: err
      });
    }

    // async.series 쿼리 시작
    async.series([
      function (callback) {
        // 첫 번째 쿼리
        connection.query(QUERY.EDU.UPD_TRAINING_USER_START_DT, [
            inputs.training_user_id
          ], 
          function (err, data) {
            callback(err, data);
          });
      },
      function (callback) {
        // 두 번째 쿼리
        connection.query(QUERY.COURSE.INS_COURSE_PROGRESS, [
            req.user.user_id, 
            inputs.training_user_id, 
            inputs.course_id,
            inputs.training_user_id, 
            inputs.course_id      
          ], 
          function (err, data) {
            callback(err, data); 
          }
        );
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
 */
router.post('/log/end', function (req, res) {

  var inputs = {
    training_user_id: req.body.training_user_id,
    course_id: req.body.course_id,
    course_group_id: req.body.course_group_id
  };

  var course_end_yn = null; 

  connection.beginTransaction(function(err) {

    // 트렌젝션 오류 발생
    if (err) { 
      res.json({
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
              console.log(query.sql);
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

module.exports = router;