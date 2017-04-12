const express = require('express');
const router = express.Router();
const mySqlDbc = require('../commons/db_conn')();
const connection = mySqlDbc.init();
const QUERY = require('../database/query');
const async = require('async');
const util = require('../util/util');

/**
 * 퀴즈 정답확인
 * JSON.parse 는 string 개체를 JSON 개체로, JSON.stringify 는 JSON 개체를 string 로 변환한다.
 * (deprecated)
 */
router.post('/log/checkanswer', util.isAuthenticated, (req, res, next) => {
  const _inputs = req.body.data;
  const trainingUserId = req.body.training_user_id;
  const courseId = req.body.course_id;
  const courseListType = req.body.course_list_type;
  let userInputQuiz;

  connection.beginTransaction((err) => {
    // 트렌젝션 오류 발생
    if (err) {
      return res.json({
        success: false,
        msg: err
      });
    }

    let quizStartIndex = 0;
    let quizEndIndex = _inputs.length - 1;

    async.whilst(
      () => {
        return quizStartIndex <= quizEndIndex;
      },
      (callback) => {
        // 사용자 입력 퀴즈 정보
        userInputQuiz = _inputs[quizStartIndex];

        // 퀴즈별로 로그를 입력한다.
        connection.query(QUERY.LOG_QUIZ.INS_QUIZ,
          [
            req.user.user_id,
            trainingUserId,
            courseId,
            courseListType,
            userInputQuiz.quiz_id,
            userInputQuiz.answer, // 사용자입력단안
            userInputQuiz.iscorrect // 정답여부
          ],
          (err, data) => {
            quizStartIndex++;
            callback(err, data);
          });
      },
      (err, results) => {
        if (err) {
          // 쿼리 오류 발생
          return connection.rollback(() => {
            res.json({
              success: false,
              msg: err
            });
          });
        } else {
          connection.commit((err) => {
            // 커밋 오류 발생
            if (err) {
              return connection.rollback(() => {
                res.json({
                  success: false,
                  msg: err
                });
              });
            }

            return res.json({
              success: true
            });
          });
        }
      }
    );
  });
});

module.exports = router;
