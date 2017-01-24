
var QUERY = require('../database/query');
var async = require('async');
var QuizService = {};

/**
 * 퀴즈 채점결과에 따라 포인트 결과를 입력한다.
 */
QuizService.setPointResult = function (_connection, _data, _callback) {

  QuizService.connection = _connection;
  
  async.waterfall([
      // 특정 타입의 문항수를 가져온다.
      function (callback) {
        QuizService.connection.query(QUERY.POINT.SEL_QUIZ_COUNT, [_data.course_id, _data.course_list_type], function (err, result) {
          callback(err, result[0].quiz_count);
        });
      },
      // 특정 타입의 맞은 문항수를 가져온다.
      function (arg1, callback) {
        QuizService.connection.query(QUERY.POINT.SEL_QUIZ_CORRECT_COUNT, [_data.training_user_id, _data.course_list_type], function (err, result) {
          callback(err, result[0].quiz_count / arg1);
        });
      },
    ],
    function (err, result) {
      _callback(err, result);
    }
  );

};


module.exports = QuizService;

