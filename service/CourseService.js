/**
 * Created by yijaejun on 03/01/2017.
 */
var QUERY = require('../database/query');
var async = require('async');
var CourseService = {};

/**
 * 퀴즈리스트를 가공한다.
 */
CourseService.makeQuizList = function (quiz_list) {
  var quiz_id = null;
  var return_list = [];

    // 데이터를 가공한다.
    // 퀴즈 별도 obj 로 분리.
    // 보기 array 형태로 퀴즈별로 할당
  quiz_list.forEach(function (quiz) {
    if (quiz_id !== quiz.quiz_id) {
      var quizdata = {};

      switch (quiz.quiz_type) {
      case 'A': // 단답형
        quizdata = {
          type: quiz.type,
          quiz_id: quiz.quiz_id,
          quiz_type: quiz.quiz_type,
          question: quiz.question,
          answer: quiz.answer_desc,
          order: quiz.quiz_order
        };
        break;

      case 'B': // 선택형
      case 'C': // 다답형
        quizdata = {
          type: quiz.type,
          quiz_id: quiz.quiz_id,
          quiz_type: quiz.quiz_type,
          question: quiz.question,
          answer: [],
          order: quiz.quiz_order,
          option_group_id: quiz.option_group_id,
          options: []
        };

        var optiondata = quiz_list.filter(function (data) {
          return data.quiz_id == quiz.quiz_id && data.option !== null;
        });

        if (optiondata) {
          for (var index = 0; index < optiondata.length; index++) {
              var option = optiondata[index];

              if (option.iscorrect) {
                quizdata.answer.push(option.option);
              }

              quizdata.options.push({
                id: option.option_id,
                opt_id: option.option_group_id,
                option: option.option,
                iscorrect: option.iscorrect,
                order: option.option_order
              });
            }

          quizdata.answer = quizdata.answer.join(', ');
        }

        break;

      default:
        break;
      }

          // 마지막 quiz_id 를 임시 저장한다.
      quiz_id = quiz.quiz_id;
          // 퀴즈를 리스트에 입력한다.
      return_list.push(quizdata);
    }
  });

  return return_list;
};

/**
 * 교육이수여부, 교육과정 이수속도를 포인트 결과에 반영한다.
 */
CourseService.setPointResult = function (_connection, _data, _callback) {
  var _query = null;

  CourseService.connection = _connection;

  async.waterfall([
      // 특정 교육과정의 기간을 가져온다.
    function (callback) {
      _query = CourseService.connection.query(QUERY.POINT.SEL_EDU_PERIOD, [_data.user.edu_id], function (err, result) {
          // console.log(_query.sql);
        callback(err, result[0].period);
      });
    },
      // 특정 교육과정의 사용자 학습기간을 가져온다.
      // 환산방법 :  (1 - 학습일수 ÷ 총 이수기간)
    function (arg1, callback) {
      _query = CourseService.connection.query(QUERY.POINT.SEL_USER_PERIOD, [_data.training_user_id], function (err, result) {
        var user_period = result[0].period;
        if (user_period !== null) { user_period === 0 ? 1 : user_period; }

          // console.log(arg1);
          // console.log(user_period);

        callback(err, (1 - (result[0].period / arg1).toFixed(2)));
      });
    },
      // 포인트 로그테이블에 교육이수여부, 이수속도를 저장한다.
    function (arg1, callback) {
      _query = CourseService.connection.query(QUERY.POINT.UPD_EDU_RESULTS, [arg1, _data.training_user_id], function (err, result) {
        if (err) console.log(err);
        callback(err, null);
      });
    },
      // 포인트 로그테이블에 교육시청 이수율을 조회한다.
    function (arg1, callback) {
      _query = CourseService.connection.query(QUERY.POINT.SEL_VIDEO_RESULTS, [_data.user.course_group_id, _data.training_user_id], function (err, result) {
        if (err) console.log(err);
        callback(err, result[0].rate);
      });
    },
      // 포인트 로그테이블에 교육시청 이수율을 갱신한다.
    function (arg1, callback) {
      _query = CourseService.connection.query(QUERY.POINT.UPD_VIDEO_RESULTS, [arg1, _data.training_user_id], function (err, result) {
        if (err) console.log(err);
        callback(err, null);
      });
    },
      // 전체 강의 반복여부를 조회한다.
    function (arg1, callback) {
      _query = CourseService.connection.query(QUERY.COURSE.SEL_COURSE_REPEAT_YN, [_data.user.course_group_id, _data.training_user_id], function (err, result) {
        if (err) console.log(err);
        callback(err, result[0] ? 0 : 1);
      });
    },
      // 포인트 로그테이블에 강의 반복률을 갱신한다.
    function (arg1, callback) {
      _query = CourseService.connection.query(QUERY.POINT.UPD_COURSE_REPEAT, [arg1, _data.training_user_id], function (err, result) {
        if (err) console.log(err);
        callback(err, null);
      });
    }
  ],
    function (err, result) {
      _callback(err, result);
    }
  );
};

module.exports = CourseService;
