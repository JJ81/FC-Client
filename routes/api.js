/* express 설정 */
var express = require('express');
var router = express.Router();
/* DB 커넥션 객체 */
var mysql_dbc = require('../commons/db_conn')();
// DB 연결
var connection = mysql_dbc.init();
// DB 연결 테스트
//mysql_dbc.test_open(connection);
// 쿼리 로드
var QUERY = require('../database/query');

// async
var async = require('async');

// url: /api/v1/course/play
// 강의 학습시작 시 호출한다.
router.post('/course/play', function (req, res) {

  var inputs = {
    training_user_id: req.body.training_user_id,
    course_id: req.body.course_id
  };      

  connection.query(QUERY.COURSE.INS_COURSE_PROGRESS, [
      req.user.user_id, 
      inputs.training_user_id, 
      inputs.course_id,
      inputs.training_user_id, 
      inputs.course_id      
    ], function (err, data) {
    if (err) {
      // 쿼리 실패시
      res.json({
        success: false,
        msg: err
      });
    } else {     
      // 쿼리 성공시
      res.json({
        'success': true
      });             
    }
  });

});

// url: /api/v1/log/video/playtime 
// 비디오 재생시간(play_seconds, 재생중 매 1분마다) 기록
router.post('/log/video/playtime', function (req, res) {
    
  var inputs = {
        user_id: req.user.user_id,
        video_id: parseInt(req.body.video_id),
        played_seconds: parseInt(req.body.timer_played_seconds)
      },
      log_id = null, // log_user_video 테이블의 id
      total_played_seconds = null; // 총 재생시간

  connection.beginTransaction(function(err) {

    // 트렌젝션 오류 발생
    if (err) { 
      res.json({
        success: false,
        msg: err
      });
    }

    // async.series 쿼리 시작
    async.series([
      function (callback) {
        // 오늘일자의 로그가 없을 경우 생성 
        var query = connection.query(QUERY.LOG_VIDEO.INS_VIDEO, [
            inputs.user_id,
            inputs.video_id,
            inputs.user_id,
            inputs.video_id
          ], 
          function (err, data) {
            // console.log(query.sql);
            callback(err, data);
          }
        );
      },
      function (callback) {
        // log id를 구한다.
        var query = connection.query(QUERY.LOG_VIDEO.SEL_MAXID, [
            inputs.user_id,
            inputs.video_id        
          ], function (err, data) {
            //console.log(query.sql);
            log_id = data[0].id;
            callback(err, data);
          });
      },
      function (callback) {
        // 재생시간을 수정한다.
        var query = connection.query(QUERY.LOG_VIDEO.UPD_VIDEO_PLAYTIME, [
            inputs.played_seconds, 
            log_id
          ], 
          function (err, data) {
            //console.log(query.sql);
            callback(err, data);
          }
        );
      },
      function (callback) {
        // 재생시간을 조회한다.
        var query = connection.query(QUERY.LOG_VIDEO.SEL_TOTAL_VIDEO_PLAYTIME, [
            inputs.user_id,
            inputs.video_id        
          ], function (err, data) {
            //console.log(query.sql);
            total_played_seconds = data[0].total_played_seconds;
            callback(err, data);
          });
      },      
    ],
    // async endpoint
    function (err, results) {
      if (err) {
        // 쿼리 오류 발생
        return connection.rollback(function() {
          console.log('rollback');
          res.json({
            success: false,
            msg: err
          });
        });
      } else {
        connection.commit(function(err) {
          // 커밋 오류 발생
          if (err) {
            return connection.rollback(function() {
              console.log('comiit rollback');              
              res.json({
                success: false,
                msg: err
              });
            });
          }
          // 커밋 성공
          console.log('commit success');
          res.json({
            success: true,
            total_played_seconds: total_played_seconds
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
router.post('/log/video/endtime', function (req, res) {
  
  var inputs = {
        user_id: req.user.user_id,
        video_id: req.body.video_id
      }, 
      log_id = null; // log_user_video 테이블의 id

  connection.beginTransaction(function(err) {

    // 트렌젝션 오류 발생
    if (err) { 
      res.json({
        success: false,
        msg: err
      });
    }

    // async.series 쿼리 시작
    async.series([
      function (callback) {
        // 오늘일자의 로그가 없을 경우 생성 
        connection.query(QUERY.LOG_VIDEO.INS_VIDEO, [
            inputs.user_id,
            inputs.video_id,
            inputs.user_id,
            inputs.video_id
          ], 
          function (err, data) {
            callback(err, data);
          }
        );
      },
      function (callback) {
        // log id를 구한다.
        var query = connection.query(QUERY.LOG_VIDEO.SEL_MAXID, [
            inputs.user_id,
            inputs.video_id        
          ], function (err, data) {
            //console.log(query.sql);
            log_id = data[0].id;
            callback(err, data);
          });
      },    
      function (callback) {
        // 종료일시를 수정한다.
        var query = connection.query(QUERY.LOG_VIDEO.UPD_VIDEO_ENDTIME, [  
            log_id
          ], 
          function (err, data) {
            console.log(query.sql);
            callback(err, data);
          }
        );
      }
    ], 
    function (err, results) {
      if (err) {

        // 쿼리 오류 발생
        return connection.rollback(function() {
          res.json({
            success: false,
            msg: err
          });
        });
      } else {
        connection.commit(function(err) {
          // 커밋 오류 발생
          if (err) {
            return connection.rollback(function() {
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

// 세션 시작일시를 기록한다.
// url: /api/v1/log/session/starttime 
router.post('/log/session/starttime', function (req, res) {

  var inputs = {
    user_id: req.user.user_id,
    training_user_id: parseInt(req.body.training_user_id),
    course_id: parseInt(req.body.course_id),
    course_list_id: parseInt(req.body.course_list_id)
  };

  var q = connection.query(QUERY.LOG_COURSE_LIST.INS_SESSION_PROGRESS, [
      inputs.user_id, 
      inputs.training_user_id,
      inputs.course_id, 
      inputs.course_list_id,
      inputs.user_id, 
      inputs.training_user_id,
      inputs.course_list_id      
    ], 
    function (err, data) {
      console.log(q.sql);
      if (err) {
        // 쿼리 실패
        res.json({
          success: false,
          msg: err
        });    
      } else {     
        // 쿼리 성공
        res.json({
          success: true
        });
      }
    }
  );

  // console.log(query);

});


// 세션 시작일시를 기록한다.
// url: /api/v1/log/session/endtime 
router.post('/log/session/endtime', function (req, res) {

  var inputs = {
    user_id: req.user.user_id,
    training_user_id: parseInt(req.body.training_user_id),
    course_id: parseInt(req.body.course_id),
    course_list_id: parseInt(req.body.course_list_id)
  };

  connection.query(QUERY.LOG_COURSE_LIST.UPD_SESSION_PROGRESS, [
      inputs.user_id, 
      inputs.training_user_id, 
      inputs.course_list_id
    ], 
    function (err, data) {
      if (err) {
        // 쿼리 실패
        res.json({
          success: false,
          msg: err
        });    
      } else {     
        // 쿼리 성공
        res.json({
          success: true
        });
      }
    }
  );  
  
});


module.exports = router;