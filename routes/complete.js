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

// 강의완료
router.get('/:training_user_id/:course_id', isAuthenticated, function (req, res) {

  var training_user_id = req.params.training_user_id,
      course_id = req.params.course_id,
      course_group = null;
  
  // 다음 강의코드를 구한다.
  async.series([
    function (callback) {
      connection.query(QUERY.COURSE.SEL_COURSE_GROUP, [ course_id, training_user_id ], function (err, data) {
        course_group = data[0];
        callback(err, data); // results[0]
      });
    },
    // 모든 강의를 완료했는지 체크

    // 다음 강의를 조회
    function (callback) {
      connection.query(QUERY.COURSE.SEL_NEXT_COURSE, [ 
          course_group.group_id, 
          course_id, 
          course_group.order, 
          training_user_id 
        ], 
        function (err, data) {
          console.log(data);
          if (data.length === 0) {
            // SEL_NEXT_COURSE 가 없을 경우 SEL_NEXT_COURSE_2 를 조회
            // SEL_NEXT_COURSE : 아직 완료하지 않은 강의 중 다음 순서
            connection.query(QUERY.COURSE.SEL_NEXT_COURSE_2, [
                course_group.group_id, 
                course_id, 
                course_group.order, 
              ], 
              function (err, data) {
                callback(err, data); // results[1]
              }
            );
          } else {
            callback(err, data); // results[1]
          }          
       }
      );
    }
  ], function (err, results) {
    if (err) {
      //console.error(err);
    } else {
      console.info(results);

      var next_course = null;
      if (results[1])
        next_course = '/' + 'course' + '/' + training_user_id + '/' + results[1][0].course_id;
      
      // 퀴즈뷰 출력
      res.render('complete', {
        current_path: 'complete',
        current_url: req.url,
        root_url: req.user.root_path,
        title: global.PROJ_TITLE,
        host: req.get('origin'),
        loggedIn: req.user,
        header: '강의완료',
        training_user_id: training_user_id,
        course_id: course_id,
        course_group_id: course_group.group_id,
        next_course: next_course
      });
    }
  });

});

module.exports = router;