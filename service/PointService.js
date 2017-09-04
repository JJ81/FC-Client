var QUERY = require('../database/query');
var async = require('async');
// let PointService = {};

/**
 * 포인트를 조회한다.
 */
exports.userpoint = (_connection, _data, _callback) => {
  let userId = _data.user_id;
  let fcId = _data.fc_id;
  let connection = _connection;

  async.series([
    // 사용자 포인트 조회
    (callback) => {
      connection.query(QUERY.POINT.SEL_USER_POINT,
        [
          fcId,
          fcId,
          userId
        ],
        (err, data) => {
          callback(err, data);
        }
      );
    }
  ],
  (err, results) => {
    if (err) {
      console.error(err);
    } else {
      _callback(null, { point_total: results[0][0].point_total });
    }
  });
};

/**
 * 포인트 로그를 쌓는다.
 *
 */
exports.save = (_connection, _data, _callback) => {
  const userId = _data.user.user_id;
  const eduId = _data.user.edu_id;
  const trainingUserId = _data.training_user_id;
  const courseGroupId = _data.user.course_group_id;
  const connection = _connection;
  let logs = {
    user_id: _data.user.user_id,
    // 교육명
    edu_name: null,
    // 교육 시작일
    edu_start_dt: null,
    // 교육 종료일
    edu_end_dt: null,
    training_user_id: trainingUserId,
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
    repetition: { value: null }
  };

  console.log('----------------------------');
  console.log('포인트 적립 시작');
  console.log('----------------------------');

  async.series(
    [
      /* 교육과정 정보 조회 */
      (callback) => {
        // console.log('SEL_COURSE_GROUP');
        connection.query(QUERY.EDU.SEL_COURSE_GROUP,
          [ trainingUserId ],
          (err, result) => {
            logs.edu_name = result[0].edu_name;
            callback(err, null);
          }
        );
      },
      /* 포인트 로그 입력 */
      (callback) => {
        // console.log('INS_POINT_LOG..');
        connection.query(QUERY.POINT.INS_POINT_LOG,
          [ userId, trainingUserId, eduId ],
          (err, result) => {
            callback(err, null);
          }
        );
      },
      /* 특정 교육과정의 전체 강의수와 이수한 강의수를 가져온다. */
      (callback) => {
        // console.log('SEL_COURSE_PROGRESS..');
        connection.query(QUERY.POINT.SEL_COURSE_PROGRESS,
          [ trainingUserId, courseGroupId ],
          (err, result) => {
            logs.complete.total_course_count = result[0].total;
            logs.complete.complete_course_count = result[0].done;
            logs.complete.value = (result[0].done / result[0].total).toFixed(2);
            callback(err, null);
          }
        );
      },
      /* 특정 교육과정의 기간과 사용자 학습 기간을 가져온다. */
      (callback) => {
        connection.query(QUERY.POINT.SEL_USER_PERIOD,
          [ trainingUserId ],
          (err, result) => {
            logs.edu_start_dt = result[0].edu_start_dt;
            logs.edu_end_dt = result[0].edu_end_dt;
            logs.speed.edu_period = result[0].edu_period === 0 ? 1 : result[0].edu_period;
            logs.speed.user_period = result[0].user_period === 0 ? 1 : result[0].user_period;
            logs.speed.edu_period_by_seconds = result[0].edu_period_by_seconds;
            logs.speed.user_period_by_seconds = result[0].user_period_by_seconds;
            logs.speed.value = 1 - (result[0].user_period_by_seconds / result[0].edu_period_by_seconds).toFixed(2);
            // logs.speed.value = 1 - (result[0].user_period / result[0].edu_period).toFixed(2);
            callback(err, null);
          }
        );
      },
      // 특정 교육과정의 퀴즈 전체, 맞은 문항수를 가져온다.
      (callback) => {
        // console.log('SEL_QUIZ_CORRECT_COUNT');
        connection.query(QUERY.POINT.SEL_QUIZ_CORRECT_COUNT,
          [ trainingUserId, courseGroupId, 'QUIZ' ],
          (err, result) => {
            if (result.total_quiz_count > 0) {
              logs.quiz_correction.total_count = result[0].total_quiz_count;
              logs.quiz_correction.correct_count = result[0].user_quiz_count;
              logs.quiz_correction.value = (result[0].user_quiz_count / result[0].total_quiz_count).toFixed(2);
              if (logs.quiz_correction.value > 1) logs.quiz_correction.value = 1;
            } else {
              logs.quiz_correction.total_count = 0;
              logs.quiz_correction.correct_count = 0;
              logs.quiz_correction.value = 0;
            }
            callback(err, null);
          }
        );
      },
      // 특정 교육과정의 파이널테스트 전체, 맞은 문항수를 가져온다.
      (callback) => {
        // console.log('SEL_QUIZ_CORRECT_COUNT');
        connection.query(QUERY.POINT.SEL_QUIZ_CORRECT_COUNT,
          [ trainingUserId, courseGroupId, 'FINAL' ],
          (err, result) => {
            if (result.total_quiz_count > 0) {
              logs.final_correction.total_count = result[0].total_quiz_count;
              logs.final_correction.correct_count = result[0].user_quiz_count;
              logs.final_correction.value = (result[0].user_quiz_count / result[0].total_quiz_count).toFixed(2);
            } else {
              logs.final_correction.total_count = 0;
              logs.final_correction.correct_count = 0;
              logs.final_correction.value = 0;
            }
            callback(err, null);
          }
        );
      },
      // 포인트 로그테이블에 교육시청 이수율을 가져온다.
      (callback) => {
        // console.log('SEL_VIDEO_RESULTS');
        connection.query(QUERY.POINT.SEL_VIDEO_RESULTS2,
        // connection.query(QUERY.POINT.SEL_VIDEO_RESULTS,
          [ courseGroupId, trainingUserId ],
          (err, result) => {
            // console.log(result);
            // logs.reeltime.duration = result[0].duration;
            // logs.reeltime.played_seconds = result[0].played_seconds;
            // logs.reeltime.value = (result[0].played_seconds / result[0].duration).toFixed(2);
            // logs.reeltime.value = logs.reeltime.value > 1 ? 1 : logs.reeltime.value; // 1보다 클 경우 1로 한정한다.

            if (result.length > 0) {
              logs.reeltime.video_count = result[0].video_count;
              logs.reeltime.video_watch_count = result[0].video_watch_count;
              logs.reeltime.value = (result[0].video_watch_count / result[0].video_count).toFixed(2);
              logs.reeltime.refresh_count = result[0].refresh_count;
            }
            callback(err, null);
          }
        );
      },
      // 강의 반복 여부를 가져온다.
      (callback) => {
        // console.log('SEL_COURSE_REPEAT_YN');
        connection.query(QUERY.COURSE.SEL_COURSE_REPEAT_YN,
          [ courseGroupId, trainingUserId ],
          (err, result) => {
            logs.repetition.value = (result == null ? 0 : 1);
            callback(err, null);
          }
        );
      },
      /* 포인트 로그 갱신 */
      (callback) => {
        // console.log(logs);
        // console.log('UPD_POINT_LOG');
        connection.query(QUERY.POINT.UPD_POINT_LOG,
          [
            logs.complete.value,
            logs.quiz_correction.value,
            logs.final_correction.value,
            logs.reeltime.value,
            logs.speed.value,
            logs.repetition.value,
            JSON.stringify(logs),
            logs.reeltime.refresh_count,
            trainingUserId
          ],
          (err, result) => {
            callback(err, null);
          }
        );
      }
    ],
    (err, results) => {
      if (err) console.log(err);
      _callback(null, null);
    }
  );
};

// module.exports = PointService;
