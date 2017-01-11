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

// 이달의/지난 교육과정
router.get(['/current', '/passed'], isAuthenticated, function(req, res){

  // 이달/지난 교육의 경로를 세션에 저장한다.
  req.user.root_path = req.originalUrl;

	// req.url 에 따라 쿼리문을 달리한다.
  var query = null,
      // 완료/미완료 order (정렬순서) 가장 낮은 강의의 id
      next_course_id = null,
      // 완료/미완료 order (정렬순서) 가장 낮은 사용자 강의의 id
      next_training_user_id = null,      
      // 완료한 강의의 수
      count_course_done = 0;

  if (req.path === '/current') {
    query = QUERY.EDU.SEL_CURRENT;
    header = '이달의 교육과정';
  } else if (req.url === '/passed') {
    query = QUERY.EDU.SEL_PASSED;
    header = '지난 교육과정';
  }

	query = connection.query(query, [req.user.user_id, req.user.user_id], function (err, data) {
		if (err) {
			// 쿼리 실패시
      return res.json({
        success: false,
        msg: err
      });
		} else {     
      ////console.log(query.sql);
			// console.log(data);
      courses = data;

      if (courses.length > 0) {
        // 학습하기 버튼 클릭 시 시작 세션 id를 구한다.
        // 기본은 id 가 가장 작은 세션이다.
        // 그 다음은 완료하지 않은 세션 중 id 가 가장 작은 세션이다. 
        next_training_user_id = courses[0].training_user_id;
        next_course_id = courses[0].course_id;
        
        for (i = 0; i < courses.length; i++) {
          if (courses[i].completed_rate !== 100) {
            next_training_user_id = courses[i].training_user_id; 
            next_course_id = courses[i].course_id;
            break;
          }
        }

        // 완료하지 않은 강의의 수
        for (var i = 0; i < courses.length; i++) {
          if (courses[i].completed_rate === 100) {
            count_course_done += 1;
          }
        }
      }

			// 쿼리 성공시
			res.render('education', {
				current_path: 'education',
        current_url: req.url,
				title: global.PROJ_TITLE,
				req: req.get('origin'),
				loggedIn: req.user,        
				header: header,
				courses: data,
        next_training_user_id: next_training_user_id,
        next_course_id: next_course_id,
        count_course_done: count_course_done
			});
		}
	});
});

module.exports = router;