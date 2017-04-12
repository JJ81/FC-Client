const express = require('express');
const router = express.Router();
const mySqlDbc = require('../commons/db_conn')();
const connection = mySqlDbc.init();
const QUERY = require('../database/query');
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};
require('../commons/helpers');
const async = require('async');
// const QuizService = require('../service/QuizService');

/**
 * 퀴즈 정답확인
 * JSON.parse 는 string 개체를 JSON 개체로, JSON.stringify 는 JSON 개체를 string 로 변환한다.
 * (deprecated)
 */
router.post('/log/checkanswer', isAuthenticated, (req, res) => {
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

/**
 * 퀴즈 정답확인
 * JSON.parse 는 string 개체를 JSON 개체로, JSON.stringify 는 JSON 개체를 string 로 변환한다.
 * (deprecated)
 */
router.post('/log/checkanswer_deprecated', isAuthenticated, (req, res) => {
  const _inputs = req.body.data;
  // console.log(_inputs);

  // quiz_id 를 SELECT IN Parameter 로 생성한다. ex. (1, 2)
  let quizIds = _inputs.map((input) => { return parseInt(input.quiz_id); });
  connection.query(QUERY.COURSE_LIST.SEL_QUIZ_2,
    [
      [quizIds]
    ],
    (err, data) => {
      if (err) {
        // 쿼리 실패
        return res.json({
          success: false,
          msg: err
        });
      } else {
        // res 반환값
        let results = []; // 반환할 결과값
        let userQuiz = null; // 사용자가 입력한 퀴즈 정보
        // let userAnswer = null; // 사용자가 입력한 답안
        let dataQuiz = null; // DB 에서 조회한 퀴즈 정보
        let quizStartIndex = 0; // 첫번째 퀴즈
        let quizEndIndex = data.length - 1; // 마지막퀴즈
        let result;

        // async 시작
        async.whilst(
          () => {
            return quizStartIndex <= quizEndIndex;
          },
          (callback) => {
            // 사용자가 입력한 퀴즈 정보를 임시저장
            userQuiz = _inputs[quizStartIndex];
            dataQuiz = data[quizStartIndex];

            if (userQuiz.answer_column === 'answer_desc') {
              // 단답형
              results.push({
                quiz_id: userQuiz.quiz_id,
                correct_answer: dataQuiz.answer_desc,
                iscorrect: (userQuiz.answer === dataQuiz.answer_desc), // 정답확인
                answer_column: userQuiz.answer_column
              });
            } else {
              // 다지선다형
              let result = {
                quiz_id: userQuiz.quiz_id,
                correct_answer: dataQuiz.answer, // id 로 넘어온다
                iscorrect: true,
                answer_column: userQuiz.answer_column
              };

              // 정답여부 체크
              userQuiz.answer_ids = JSON.parse('[' + userQuiz.answer_ids + ']');
              dataQuiz.answer = JSON.parse('[' + dataQuiz.answer + ']');

              if (userQuiz.answer_ids.length !== dataQuiz.answer.length || !dataQuiz.answer.length || !userQuiz.answer_ids.length) { result.iscorrect = false; } else {
                for (var i = 0; i < dataQuiz.answer.length; i++) {
                  for (var j = 0; j < userQuiz.answer_ids.length; j++) {
                    if (userQuiz.answer_ids[j] !== dataQuiz.answer[i]) { result.iscorrect = false; } else {
                      result.iscorrect = true;
                      break;
                    }
                  }

                  if (!result.iscorrect) { break; }
                }
              }

              // 옵션명 조회
              connection.query(QUERY.COURSE_LIST.SEL_OPTION,
                [
                  [JSON.parse('[' + dataQuiz.answer + ']')]
                ],
                (err, optionNames) => {
                  if (err) {
                    console.log(err);
                  } else {
                    result.correct_answer = optionNames[0].correct_answer; // ex. 보기1, 보기2
                  }
                }
              );
              results.push(result);
            } // endif

            quizStartIndex++;
            callback(err, result);
          },
          (err, data) => {
            if (err) {
              console.log(err);
            } else {
              // console.log('정답확인완료!');
            }
          }
        );

        // console.log('중간결과');
        // console.log(results);

        // 로그(log_user_quiz) 입력
        // console.log('로그입력시작!');
        connection.beginTransaction((err) => {
          // 트렌젝션 오류 발생
          if (err) {
            return res.json({
              success: false,
              msg: err
            });
          }

          quizStartIndex = 0;
          quizEndIndex = results.length - 1;

          async.whilst(
            () => {
              return quizStartIndex <= quizEndIndex;
            },
            (callback) => {
              // 사용자 입력 퀴즈 정보
              userQuiz = _inputs[quizStartIndex];

              // 퀴즈별로 로그를 입력한다.
              connection.query(QUERY.LOG_QUIZ.INS_QUIZ, [
                req.user.user_id,
                parseInt(userQuiz.quiz_id),
                userQuiz.answer !== undefined ? userQuiz.answer : userQuiz.answer_names, // 사용자입력단안
                results[quizStartIndex].iscorrect ? 1 : 0, // 정답여부
                req.user.user_id,
                parseInt(userQuiz.quiz_id)
              ],
                (err, data) => {
                  // //console.log(query.sql);
                  quizStartIndex++;
                  callback(err, data);
                });
            },
            (err, data) => {
              if (err) {
                // 쿼리 오류
                return connection.rollback(() => {
                  // console.log('쿼리오류발생!');
                  // console.log(err);
                });
              } else {
                connection.commit((err) => {
                  // 커밋 오류
                  if (err) {
                    return connection.rollback(() => {
                      // console.log('커밋오류발생!');
                      // console.log(err);
                    });
                  } else {
                    // console.log('로그입력종료!');
                  }
                });
              }
            }
          );

          // //console.log(results);

          res.json({
            'success': true,
            'msg': '성공!',
            'results': results
          });
        });
      }
    });
});

module.exports = router;
