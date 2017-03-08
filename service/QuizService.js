
var QUERY = require('../database/query');
var async = require('async');
var QuizService = {};

/**
 * 퀴즈 채점결과에 따라 포인트 결과를 입력한다.
 */
QuizService.setPointResult = function (_connection, _data, _callback) {
  var _query = null;

  QuizService.connection = _connection;

  async.waterfall([
      // 특정 타입의 문항수를 가져온다.
    function (callback) {
        _query = QuizService.connection.query(QUERY.POINT.SEL_QUIZ_COUNT, [_data.user.course_group_id, _data.course_list_type], function (err, result) {
          console.log(_query.sql);
          callback(err, result[0].quiz_count);
        });
      },
      // 특정 타입의 맞은 문항수를 가져온다.
    function (arg1, callback) {
        _query = QuizService.connection.query(QUERY.POINT.SEL_QUIZ_CORRECT_COUNT, [_data.training_user_id, _data.course_list_type], function (err, result) {
          callback(err, (result[0].quiz_count / arg1).toFixed(2));
        });
      },
      // 포인트 로그테이블에 저장한다.
    function (arg1, callback) {
        if (_data.course_list_type === 'QUIZ')
          {_query = QuizService.connection.query(QUERY.POINT.UPD_QUIZ_CORRECTION, [arg1, _data.training_user_id], function (err, result) {
            callback(err, null);
          });}
        else if (_data.course_list_type === 'FINAL')
          {_query = QuizService.connection.query(QUERY.POINT.UPD_FINAL_CORRECTION, [arg1, _data.training_user_id], function (err, result) {
            callback(err, null);
          });}
      }
  ],
    function (err, result) {
      _callback(err, result);
    }
  );
};

module.exports = QuizService;

