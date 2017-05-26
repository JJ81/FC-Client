const express = require('express');
const router = express.Router();
const mysqlDbc = require('../commons/db_conn')();
const connection = mysqlDbc.init();
const QUERY = require('../database/query');
const async = require('async');
const util = require('../util/util');

/**
 * 비디오 환경설정값을 리턴한다.
 * interval: 시청시간 기록 주기
 * confirm_delay :
 * - 비디오 시청 종료 후 눌러야 하는 팝업이 떠있는 시간.
 * - 누르지 않을 경우 비디오 학습이력 초기화 한다.
 */
router.get('/settings', util.isAuthenticated, (req, res, next) => {
  return res.json({
    success: true,
    interval: 10, // TODO: 서비스 오픈 전에 적절한 시간으로 변경할 것.
    waiting_seconds: 31 // 대기시간 5초 + 1초 delay
  });
});

// url: /api/v1/log/video/playtime
// 비디오 재생시간(play_seconds, 재생중 매 5초 마다) 기록
router.post('/log/playtime', util.isAuthenticated, (req, res, next) => {
  const inputs = {
    user_id: req.user.user_id,
    training_user_id: req.body.training_user_id,
    video_id: req.body.video_id,
    played_seconds: req.body.played_seconds,
    video_duration: req.body.video_duration,
    currenttime: req.body.currenttime
  };
  let videoLogId = null; // log_user_video 테이블의 id
  let totalPlayedSeconds = null; // 총 재생시간

  connection.beginTransaction((err) => {
    // 트렌젝션 오류 발생
    if (err) {
      res.json({
        success: false,
        msg: err
      });
    }

    // async.series 쿼리 시작
    async.series([
      (callback) => {
        // 오늘일자의 로그가 없을 경우 생성
        connection.query(QUERY.LOG_VIDEO.INS_VIDEO, [
          inputs.user_id,
          inputs.training_user_id,
          inputs.video_id,
          inputs.training_user_id,
          inputs.video_id
        ],
          (err, data) => {
            // console.log(query.sql);
            callback(err, data);
          }
        );
      },
      (callback) => {
        // log id를 구한다.
        connection.query(QUERY.LOG_VIDEO.SEL_MAXID, [
          inputs.user_id,
          inputs.video_id
        ], (err, data) => {
          videoLogId = data[0].id;
          callback(err, data);
        });
      },
      (callback) => {
        // 재생시간을 수정한다.
        connection.query(QUERY.LOG_VIDEO.UPD_VIDEO_PLAYTIME, [
          inputs.played_seconds,
          inputs.video_duration,
          inputs.currenttime,
          videoLogId
        ],
          (err, data) => {
            callback(err, data);
          }
        );
      },
      (callback) => {
        // 재생시간을 조회한다.
        connection.query(QUERY.LOG_VIDEO.SEL_TOTAL_VIDEO_PLAYTIME, [
          inputs.user_id,
          inputs.training_user_id,
          inputs.video_id
        ], (err, data) => {
          totalPlayedSeconds = data[0].total_played_seconds;
          callback(err, data);
        });
      }
    ],
    // async endpoint
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
          // 커밋 오류 발생
          if (err) {
            return connection.rollback(() => {
              res.json({
                success: false,
                msg: err
              });
            });
          }
          // 커밋 성공
          res.json({
            success: true,
            total_played_seconds: totalPlayedSeconds
          });
        });
      }
    });
  });
});

// url: /api/v1/log/video/endtime
// 아래의 경우, 비디오 종료시간을 기록한다.
// 1. 일시정지
// 2. 영상이 끝났을 때
// 3. 재생 중 다음으로 넘어가는 경우
router.post('/log/endtime', util.isAuthenticated, (req, res, next) => {
  var inputs = {
    user_id: req.user.user_id,
    video_id: req.body.video_id,
    video_duration: req.body.video_duration
  };
  var videoLogId = null; // log_user_video 테이블의 id

  connection.beginTransaction((err) => {
    // 트렌젝션 오류 발생
    if (err) {
      return res.json({
        success: false,
        msg: err
      });
    }

    // async.series 쿼리 시작
    async.series([
      (callback) => {
        // log id를 구한다.
        connection.query(QUERY.LOG_VIDEO.SEL_MAXID, [
          inputs.user_id,
          inputs.video_id
        ], (err, data) => {
          videoLogId = data[0].id;
          callback(err, data);
        });
      },
      (callback) => {
        // 종료일시를 수정한다.
        connection.query(QUERY.LOG_VIDEO.UPD_VIDEO_ENDTIME, [
          videoLogId
        ],
          (err, data) => {
            callback(err, data);
          }
        );
      }
    ],
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
          // 커밋 성공
          res.json({
            success: true
          });
        });
      }
    });
  });
});

/**
 * 로그를 삭제한다.
 * 비디오 시청 완료 후, 정해신 시간 내 다음 스텝으로 넘어가지 않을 경우 초기화
 */
router.delete('/log', util.isAuthenticated, (req, res, next) => {
  var inputs = {
    user_id: req.user.user_id,
    video_id: req.query.video_id
  };
  var videoLogId = null;

  async.series([
    // 오늘의 마지막 비디오 로그 아이디를 구한다.
    (callback) => {
      connection.query(QUERY.LOG_VIDEO.SEL_MAXID, [inputs.user_id, inputs.video_id], (err, data) => {
        videoLogId = data[0].id;
        callback(err, data); // results[0]
      });
    },
    // 위에서 구한 로그 아이디로 비디오 로그를 삭제한다.
    (callback) => {
      connection.query(QUERY.LOG_VIDEO.DELETE_VIDEO_LOG, [videoLogId], (err, data) => {
        callback(err, data); // results[1]
      });
    }
  ],
  (err, results) => {
    if (err) {
      // 쿼리 실패
      return res.json({
        success: false,
        msg: err
      });
    } else {
      // 쿼리 성공
      return res.json({
        success: true
      });
    }
  });
});

module.exports = router;
