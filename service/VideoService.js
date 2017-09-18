const QUERY = require('../database/query');
const pool = require('../commons/db_conn_pool');
const async = require('async');

exports.logPlayTime = (_data, _callback) => {
  let videoLogId = null; // log_user_video 테이블의 id
  // let totalPlayedSeconds = 0; // 총 재생시간

  pool.getConnection((err, connection) => {
    if (err) throw err;

    connection.beginTransaction(err => {
      if (err) throw err;

      async.series(
        [
          callback => {
            // 오늘일자의 로그가 없을 경우 생성
            connection.query(QUERY.LOG_VIDEO.INS_VIDEO, [
              _data.user_id,
              _data.training_user_id,
              _data.video_id,
              _data.training_user_id,
              _data.video_id
            ],
              (err, data) => {
                callback(err, data);
              }
            );
          },
          callback => {
            // log id를 구한다.
            connection.query(QUERY.LOG_VIDEO.SEL_MAXID, [
              _data.user_id,
              _data.video_id
            ], (err, data) => {
              videoLogId = data[0].id;
              callback(err, data);
            });
          },
          // callback => {
          //   // 재생시간을 조회한다.
          //   connection.query(QUERY.LOG_VIDEO.SEL_TOTAL_VIDEO_PLAYTIME, [
          //     _data.user_id,
          //     _data.training_user_id,
          //     _data.video_id
          //   ], (err, data) => {
          //     totalPlayedSeconds = data[0].total_played_seconds;
          //     callback(err, data);
          //   });
          // },
          callback => {
            // 재생시간을 수정한다.
            connection.query(QUERY.LOG_VIDEO.UPD_VIDEO_PLAYTIME2, [
              _data.total_played_seconds + _data.played_seconds,
              _data.video_duration,
              _data.currenttime,
              videoLogId
            ],
            (err, data) => {
              callback(err, data);
            });
          }
        ],
        (err, results) => {
          connection.release();
          if (err) {
            connection.rollback(() => {
              throw err;
            });
          } else {
            connection.commit((err) => {
              if (err) throw err;
              _callback(null, {
                success: true
              });
            });
          }
        }
      );
    });
  });
};

exports.CheckPlayTime = (_data, _callback) => {
  let totalPlayedSeconds;
  let videoDuration;

  console.log(_data);

  pool.getConnection((err, connection) => {
    if (err) throw err;
    async.series(
      [
        callback => {
          // 재생시간을 조회한다.
          connection.query(QUERY.LOG_VIDEO.SEL_TOTAL_VIDEO_PLAYTIME, [
            _data.user_id,
            _data.training_user_id,
            _data.video_id
          ], (err, data) => {
            totalPlayedSeconds = data[0].total_played_seconds;
            videoDuration = data[0].max_duration;
            callback(err, data);
          });
        }
      ],
      (err, results) => {
        connection.release();
        if (err) {
          console.error(err);
          throw new Error(err);
        } else {
          if (Math.floor(videoDuration * 0.8) <= totalPlayedSeconds) {
            _callback(null, { passive: true });
          } else {
            _callback(null, { passive: false });
          }
        }
      }
    );
  });
};
