var QUERY = require('../database/query');
var async = require('async');
var PointService = {};

/**
 * 포인트를 조회한다.
 */
PointService.userpoint = function ( _connection, _data, _callback ) {

  var user_id = _data.user_id,
      fc_id = _data.fc_id,
	    connection = _connection,
	    logger = null,
      point_weight = null;

  async.series([
    // 포인트 설정값 조회
    function (callback) {
      logger = connection.query(QUERY.POINT.SEL_POINT_WEIGHT, [fc_id], function (err, data) {
        // console.log(logger.sql);
        point_weight = data[0];
        callback(err, data);
      });
    },
    // 사용자 포인트 조회
    function (callback) {
      logger = connection.query(QUERY.POINT.SEL_USER_POINT, 
        [
          // point_weight.point_complete,
          // point_weight.point_quiz,
          // point_weight.point_final,
          // point_weight.point_reeltime,
          // point_weight.point_speed,
          // point_weight.point_repetition,   
          fc_id,       
          fc_id, 
          user_id
        ], 
        function (err, data) {
          // console.log(logger.sql);
          callback(err, data);
        }
      );
    }
  ], function (err, results) {
    if (err) {
      console.error(err);
    } else {
      _callback(null, { point_total: results[1][0].point_total });
    }
  });
};

/**
 * 포인트 로그를 쌓는다.
 * 
 */
PointService.save = function ( _connection, _data, _callback ) {
	
	var user_id = _data.user.user_id;
	var edu_id = _data.user.edu_id;
	var training_user_id = _data.training_user_id;
	var course_group_id = _data.user.course_group_id;
	var connection = _connection;
	var logger = null;
	var logs = {
		user_id: _data.user.user_id,
		// 교육명
		edu_name: null,
		// 교육 시작일
		edu_start_dt: null,
		// 교육 종료일
		edu_end_dt: null,
		training_user_id: training_user_id,
		// 교육과정 이수
		complete: { value: null, total_course_count: null, complete_course_count: null },
		// 교육과정 이수 속도
		speed: { value: null, edu_period: null, user_period: null },
		// 퀴즈
		quiz_correction: { value: null, total_count: null, correct_count: null },
		// 파이널 테스트
		final_correction: { value: null, total_count: null, correct_count: null },
		// 교육 시청시간
		reeltime: { value: null, duration: null, played_seconds: null },
		// 강의 반복 학습율		
		repetition: { value: null },
	};
  
  console.log('----------------------------');
  console.log('포인트 적립 시작');
  console.log('----------------------------');

	async.series(
		[
			/* 교육과정 정보 조회 */
			function (callback) {
				connection.query(QUERY.EDU.SEL_COURSE_GROUP, 
					[ training_user_id ], 
					function (err, result) {
						logs.edu_name = result[0].edu_name;
						logs.edu_start_dt = result[0].start_dt;
						logs.edu_end_dt = result[0].end_dt;
						callback(err, null);
					}
				);
			},
			/* 포인트 로그 입력 */
			function (callback) {
				logger = connection.query(QUERY.POINT.INS_POINT_LOG, 
					[ user_id, training_user_id, edu_id ], 
					function (err, result) {
            console.log(logger.sql);
						callback(err, null);
					}
				);
			},
			/* 특정 교육과정의 전체 강의수와 이수한 강의수를 가져온다. */
			function (callback) {				
				logger =
					connection.query(QUERY.POINT.SEL_COURSE_PROGRESS, 
						[ training_user_id, course_group_id ], 
						function (err, result) {
							logs.complete.total_course_count = result[0].total;
							logs.complete.complete_course_count = result[0].done;
							logs.complete.value = 
								(result[0].done / result[0].total).toFixed(2);
							callback(err, null);
						}
					);
			},
			/* 특정 교육과정의 기간과 사용자 학습 기간을 가져온다. */
			function (callback) {		
				logger =
					connection.query(QUERY.POINT.SEL_USER_PERIOD, 
						[ edu_id, training_user_id ], 
						function (err, result) {
							logs.speed.edu_period = result[0].edu_period === 0 ? 1 : result[0].edu_period;
							logs.speed.user_period = result[0].user_period === 0 ? 1 : result[0].user_period;
							logs.speed.value =  
								1 - (result[0].user_period / result[0].edu_period).toFixed(2);
							callback(err, null);
						}
					);						
			},
			// 특정 교육과정의 퀴즈 전체, 맞은 문항수를 가져온다.
			function (callback) {	
				logger = 
					connection.query(QUERY.POINT.SEL_QUIZ_CORRECT_COUNT, 
						[ training_user_id, course_group_id, 'QUIZ' ], 
						function (err, result) {
							logs.quiz_correction.total_count = result[0].total_quiz_count;
							logs.quiz_correction.correct_count = result[0].user_quiz_count;
							
							logs.quiz_correction.value = 
								(result[0].user_quiz_count / result[0].total_quiz_count).toFixed(2);
							if (logs.quiz_correction.value > 1) logs.quiz_correction.value = 1;

							callback(err, null);
						}
					);							
			},
			// 특정 교육과정의 파이널테스트 전체, 맞은 문항수를 가져온다.
			function (callback) {	
				logger = 
					connection.query(QUERY.POINT.SEL_QUIZ_CORRECT_COUNT, 
						[ training_user_id, course_group_id, 'FINAL' ], 
						function (err, result) {
							logs.final_correction.total_count = result[0].total_quiz_count;
							logs.final_correction.correct_count = result[0].user_quiz_count;
							logs.final_correction.value = 
								(result[0].user_quiz_count / result[0].total_quiz_count).toFixed(2);
							callback(err, null);
						}
					);
			},		
			// 포인트 로그테이블에 교육시청 이수율을 가져온다.	
			function (callback) {	
				logger = 
					connection.query(QUERY.POINT.SEL_VIDEO_RESULTS, 
						[ course_group_id, training_user_id ], 
						function (err, result) {
							logs.reeltime.duration = result[0].duration;
							logs.reeltime.played_seconds = result[0].played_seconds;
							logs.reeltime.value = 
								(result[0].played_seconds / result[0].duration).toFixed(2);
              logs.reeltime.value = logs.reeltime.value > 1 ? 1 : logs.reeltime.value; // 1보다 클 경우 1로 한정한다.

							callback(err, null);
						}
					);
			},
			// 강의 반복 여부를 가져온다.
			function (callback) {
				logger = 
					connection.query(QUERY.COURSE.SEL_COURSE_REPEAT_YN, 
						[ course_group_id, training_user_id ], 
						function (err, result) {
							logs.repetition.value = (result == null ? 0 : 1);
            				callback(err, null);
          				}
					);						
			},
			/* 포인트 로그 갱신 */
			function (callback) {
				connection.query(QUERY.POINT.UPD_POINT_LOG, 
					[ 						
						logs.complete.value,
						logs.quiz_correction.value,
						logs.final_correction.value,
						logs.reeltime.value,
						logs.speed.value,
						logs.repetition.value,
						JSON.stringify(logs),
						training_user_id
					],
					function (err, result) {
						callback(err, null);
					}
				);
			},
		],
		function (err, results) {
			if (err) console.log(err);
			// console.log(logs);
			_callback(null, null);
		}
	);
};

module.exports = PointService;