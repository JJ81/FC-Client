var express = require('express');
var router = express.Router();
var mysql_dbc = require('../commons/db_conn')();
var connection = mysql_dbc.init();
var QUERY = require('../database/query');
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
};
require('../commons/helpers');

// 강의/강사 평가
router.get('/:training_user_id/:course_id', isAuthenticated, function (req, res) {
  var hostName = req.headers.host;
  var logoName = null;
  var logoImageName = null;

  logoName = hostName.split('.')[1];
  logoName = logoName === undefined ? 'orangenamu' : logoName;
  logoImageName = logoName + '.png';

  var training_user_id = req.params.training_user_id;
  var course_id = req.params.course_id;
  var root_path = '/' + req.path.split('/')[1]; // edulist / eduoldlist
  var next_url = '/' + 'complete' + '/' + training_user_id + '/' + course_id; // 강의롼료 페이지

  // 평가기록을 조회한다.
  connection.query(QUERY.COURSE.SEL_EVALUATE, [req.user.user_id, course_id], function (err, data) {
    if (err) {
      // 쿼리 실패
      res.json({
        success: false,
        msg: err
      });
    } else {
      // 쿼리 성공
      if (data.length > 0) {
        // 평가가 존재할 경우 다음 페이지로 곧장 넘어간다.
        res.redirect(next_url);
      } else {
        // 강의평가뷰 출력
        res.render('evaluate', {
          group_path: 'contents',
          current_path: 'evaluate',
          current_url: req.url,
          title: global.PROJ_TITLE,
          logo: logoName,
          logo_image: logoImageName,
          host: req.get('origin'),
          loggedIn: req.user,
          header: '평가하기',
          next_url: next_url,
          course_id: course_id
        });
      }
    }
  });
});

// 강의/강사평가
router.post('/log', isAuthenticated, function (req, res) {
  var inputs = {
    user_id: req.user.user_id,
    course_id: req.body.course_id,
    course_rating: req.body.course_rating,
    teacher_rating: req.body.teacher_rating
  };

  var query = connection.query(QUERY.COURSE.INS_EVALUATE, [
    inputs.user_id,
    inputs.course_rating,
    inputs.teacher_rating,
    inputs.course_id,
    inputs.user_id
  ], function (err, data) {
    // console.log(query.sql);

    if (err) {
      // 쿼리 실패
      res.json({
        success: false,
        msg: err
      });
    } else {
      // 쿼리 성공
      res.json({
        'success': true
      });
    }
  });
});

module.exports = router;
