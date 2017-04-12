const express = require('express');
const router = express.Router();
const mySqlDbc = require('../commons/db_conn')();
const connection = mySqlDbc.init();
const QUERY = require('../database/query');
const async = require('async');
const util = require('../util/util');

// 강의완료
router.get('/:training_user_id/:course_id', util.isAuthenticated, util.getLogoInfo, (req, res, next) => {
  const { training_user_id: trainingUserId, course_id: courseId } = req.params;
  let courseGroup;

  // 다음 강의코드를 구한다.
  async.series([
    (callback) => {
      connection.query(QUERY.COURSE.SEL_COURSE_GROUP, [ courseId, trainingUserId ], (err, data) => {
        courseGroup = data[0];
        callback(err, data); // results[0]
      });
    },
    // 모든 강의를 완료했는지 체크

    // 다음 강의를 조회
    (callback) => {
      connection.query(QUERY.COURSE.SEL_NEXT_COURSE, [
        courseGroup.group_id,
        courseId,
        courseGroup.order,
        trainingUserId
      ],
        (err, data) => {
          if (data.length === 0) {
            // SEL_NEXT_COURSE 가 없을 경우 SEL_NEXT_COURSE_2 를 조회
            // SEL_NEXT_COURSE : 아직 완료하지 않은 강의 중 다음 순서
            connection.query(QUERY.COURSE.SEL_NEXT_COURSE_2,
              [
                courseGroup.group_id,
                courseId,
                courseGroup.order
              ],
              (err, data) => {
                callback(err, data); // results[1]
              }
            );
          } else {
            callback(err, data); // results[1]
          }
        }
      );
    }
  ],
  (err, results) => {
    if (err) {
      console.error(err);
    } else {
      let nextCourse = null;
      if (results[1][0]) {
        nextCourse = '/' + 'course' + '/' + trainingUserId + '/' + results[1][0].course_id;
      }

      // 퀴즈뷰 출력
      res.render('complete', {
        group_path: 'contents',
        current_path: 'complete',
        current_url: req.url,
        root_url: req.user.root_path,
        host: req.get('origin'),
        loggedIn: req.user,
        header: '강의완료',
        training_user_id: trainingUserId,
        course_id: courseId,
        course_group_id: courseGroup.group_id,
        next_course: nextCourse
      });
    }
  });
});

module.exports = router;
