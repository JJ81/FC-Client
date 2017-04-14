const express = require('express');
const router = express.Router();
const QUERY = require('../database/query');
const pool = require('../commons/db_conn_pool');
const async = require('async');
const util = require('../util/util');

/**
 * 퀴즈 정답확인
 * JSON.parse 는 string 개체를 JSON 개체로, JSON.stringify 는 JSON 개체를 string 로 변환한다.
 * (deprecated)
 */
router.post('/submit', util.isAuthenticated, (req, res, next) => {
  const {
    answers: userAnswers,
    training_user_id: trainingUserId,
    course_id: courseId,
    course_list_id: courseListId
    // checklist_group_id: checkListGroupId
  } = req.body;

  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.beginTransaction((err) => {
      if (err) {
        return res.json({
          success: false,
          msg: err
        });
      }

      let startIndex = 0;
      let endIndex = userAnswers.length - 1;

      async.whilst(
        () => {
          return startIndex <= endIndex;
        },
        (callback) => {
          connection.query(QUERY.LOG_CHECKLIST.InsertUserAnswers,
            [
              req.user.user_id,
              trainingUserId,
              req.user.edu_id,
              courseId,
              courseListId,
              userAnswers[startIndex].id,
              userAnswers[startIndex].answer
            ],
            (err, data) => {
              if (err) {
                console.log(err);
              }
              startIndex++;
              callback(err, data);
            });
        },
        (err, results) => {
          if (err) {
            return connection.rollback(() => {
              res.json({
                success: false,
                msg: err
              });
            });
          } else {
            connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  res.json({
                    success: false,
                    msg: err
                  });
                });
              }

              connection.release();
              return res.json({
                success: true
              });
            });
          }
        }
      );
    });
  });
});

module.exports = router;
