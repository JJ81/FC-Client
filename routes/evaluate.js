const express = require('express');
const router = express.Router();
const mysqlDbc = require('../commons/db_conn')();
const connection = mysqlDbc.init();
const QUERY = require('../database/query');
const util = require('../util/util');

// 강의/강사 평가
router.get('/:training_user_id/:course_id', util.isAuthenticated, util.getLogoInfo, (req, res, next) => {
  const { training_user_id: trainingUserId, course_id: courseId } = req.params;
  // let rootPath = '/' + req.path.split('/')[1]; // edulist / eduoldlist
  let nextUrl = '/' + 'complete' + '/' + trainingUserId + '/' + courseId; // 강의롼료 페이지

  // 평가기록을 조회한다.
  connection.query(QUERY.COURSE.SEL_EVALUATE, [req.user.user_id, courseId], (err, data) => {
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
        res.redirect(nextUrl);
      } else {
        // 강의평가뷰 출력
        res.render('evaluate', {
          group_path: 'contents',
          current_path: 'evaluate',
          current_url: req.url,
          host: req.get('origin'),
          loggedIn: req.user,
          header: '평가하기',
          next_url: nextUrl,
          course_id: courseId,
          training_user_id: trainingUserId
        });
      }
    }
  });
});

// 강의/강사평가
router.post('/log', util.isAuthenticated, (req, res, next) => {
  var inputs = {
    user_id: req.user.user_id,
    course_id: req.body.course_id,
    course_rating: req.body.course_rating,
    teacher_rating: req.body.teacher_rating
  };

  connection.query(QUERY.COURSE.INS_EVALUATE,
    [
      inputs.user_id,
      inputs.course_rating,
      inputs.teacher_rating,
      inputs.course_id,
      inputs.user_id
    ],
    (err, data) => {
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
