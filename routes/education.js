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

// 이달의/지난 교육과정
router.get(['/current', '/passed'], isAuthenticated, function (req, res) {
  var hostName = req.headers.host;
  var logoName = null;
  var logoImageName = null;

  logoName = hostName.split('.')[1];
  logoName = logoName === undefined ? 'orangenamu' : logoName;
  logoImageName = logoName + '.png';

  // 이달/지난 교육의 경로를 세션에 저장한다.
  req.user.root_path = req.originalUrl;

  // req.url 에 따라 쿼리문을 달리한다.
  var query;
  // 완료/미완료 order (정렬순서) 가장 낮은 강의의 id
  var nextCourseId = null;
  // 완료/미완료 order (정렬순서) 가장 낮은 사용자 강의의 id
  var nextTrainingUserId = null;
  // 완료한 강의의 수
  var courseDoneCount = 0;
  var header, courses;

  if (req.path === '/current') {
    query = QUERY.EDU.SEL_CURRENT;
    header = '이달의 교육과정';
  } else if (req.url === '/passed') {
    query = QUERY.EDU.SEL_PASSED;
    header = '지난 교육과정';
  }

  connection.query(query, [req.user.user_id, req.user.user_id], function (err, data) {
    if (err) {
      return res.json({
        success: false,
        msg: err
      });
    } else {
      courses = data;

      if (courses.length > 0) {
        // 학습하기 버튼 클릭 시 시작 세션 id를 구한다.
        // 기본은 id 가 가장 작은 세션이다.
        // 그 다음은 완료하지 않은 세션 중 id 가 가장 작은 세션이다.
        nextTrainingUserId = courses[0].training_user_id;
        nextCourseId = courses[0].course_id;

        for (i = 0; i < courses.length; i++) {
          if (courses[i].completed_rate !== 100) {
            nextTrainingUserId = courses[i].training_user_id;
            nextCourseId = courses[i].course_id;
            break;
          }
        }

        // 완료하지 않은 강의의 수
        for (var i = 0; i < courses.length; i++) {
          if (courses[i].completed_rate === 100) {
            courseDoneCount += 1;
          }
        }
      }

    // 쿼리 성공시
      res.render('education', {
        current_path: 'education',
        current_url: req.url,
        title: global.PROJ_TITLE,
        logo: logoName,
        logo_image: logoImageName,
        req: req.get('origin'),
        loggedIn: req.user,
        header: header,
        courses: data,
        nextTrainingUserId: nextTrainingUserId,
        nextCourseId: nextCourseId,
        courseDoneCount: courseDoneCount
      });
    }
  });
});

module.exports = router;
