var express = require('express');
var router = express.Router();
var mysql_dbc = require('../commons/db_conn')();
var connection = mysql_dbc.init();
var QUERY = require('../database/query');
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
};
require('../commons/helpers');
var async = require('async');

/**
 * 세션 학습시작
 */
router.get('/:training_user_id/:course_id/:course_list_id', isAuthenticated, function (req, res) {

  // TODO
  // 2. 비디오인지, 퀴즈인지, 테스트인지 구분할 수 있어야 한다. V
  // 3. 비디오일 경우 plyr 연결 -> 비메오 이슈 해결해야함. X
  // 5. 정답체크는 서버에서 한 후 결과를 내려줘야 한다.(?), 클라에서 우선 진행해도 무방
  // 6. 다음 세션id 를 가져와야 한다. V
  // 7. 평가이력이 존재할 경우 완료페이지로 바로 이동해야 한다. V 
  // 8. 비디오 로깅시간 서버에서 내려줄 것, 정해진 시간 이전에 로깅하는지도 체크할 것

  // BUG
  // 1. 반복하기 시 첫번째 세션이후 다음버튼을 클릭하면, 평가페이지로 이동

  var training_user_id = req.params.training_user_id,
      course_id = req.params.course_id, 
      course_list_id = req.params.course_list_id,
      course_list = null,
      session = null, // course_list 데이터 저장
      query = null;

  async.series([
    function (callback) {
      query = connection.query(QUERY.COURSE_LIST.SEL_INDEX, [training_user_id, course_list_id], function (err, data) {
        course_list = data[0];

        // console.log('course_list : ');
        // console.log(course_list);
        callback(err, data); // results[0]
      });
    },
    function (callback) {
      // console.log(query.sql);

      switch (course_list.type) {
        case 'VIDEO':
          connection.query(QUERY.COURSE_LIST.SEL_VIDEO, [course_list.video_id], function (err, data) {
            callback(err, data); // results[1]
          });          
          break;

        default: // QUIZ / FINAL
          connection.query(QUERY.COURSE_LIST.SEL_QUIZ, [course_list.quiz_group_id], function (err, data) {
            callback(err, data); // results[1]
          });
          break;
      }
    },
    function (callback) {
      switch (course_list.type) {
        case 'VIDEO':      
          // 비디오 총 시청시간 조회
          connection.query(QUERY.LOG_VIDEO.SEL_TOTAL_VIDEO_PLAYTIME, [
            req.user.user_id,
            course_list.video_id        
          ], function (err, data) {
            callback(err, data); // results[2]
          });
          break;
        
        default:
          callback(null, null);
          break;
      }

    }
  ], function (err, results) {
    if (err) {
      //console.error(err);
    } else {

      // 다음으로 버튼 클릭시 이동할 페이지
      var root_path = '/' + req.path.split("/")[1],
          next_url = null;
      
      // course_list => (query.js) QUERY.COURSE_LIST.SEL_INDEX
      if (course_list.next_id)
        next_url = '/' + 'session' + '/' + training_user_id + '/' + course_id + '/' + course_list.next_id;
      else
        next_url = '/' + 'evaluate' + '/' + training_user_id + '/' + course_id; 

      if (course_list.type === 'VIDEO') {

          // 비디오 총 시청시간을 조회한다.
          // console.log('total_played_seconds : ' + results[2][0].total_played_seconds);

          // console.log(results[1][0]);

          // 비디오뷰 출력
          res.render('video', {
            current_path: 'video',
            current_url: req.url,
            title: global.PROJ_TITLE,
            host: req.get('origin'),
            loggedIn: req.user,
            header: course_list.title,
            content: results[1][0],
            total_played_seconds: results[2][0].total_played_seconds,
            next_url: next_url,            
            training_user_id: training_user_id,
            course_id: course_id,
            course_list_id: course_list_id        
          });

      }		        
      else {

          // 보기옵션명과, 보기옵션id 를 배열로 변환한다.
          var tmp = null;
          for (var i = 0; i < results[1].length; i++) {
            // quiz_options
            tmp = results[1][i].quiz_options;
            if (tmp)
              results[1][i].quiz_options = tmp.split(',');
            // quiz_option_ids
            tmp = results[1][i].quiz_option_ids;
            if (tmp)
              results[1][i].quiz_option_ids = JSON.parse('[' + tmp + ']');
          }

          console.log(results[1]);

          // 퀴즈뷰 출력
          res.render('quiz', {
            current_path: 'quiz',
            current_url: req.url,
            title: global.PROJ_TITLE,
            host: req.get('origin'),
            loggedIn: req.user,
            header: course_list.title,
            contents: results[1],
            next_url: next_url,            
            training_user_id: training_user_id,
            course_id: course_id,
            course_list_id: course_list_id,
            prev_yn: course_list.prev_yn
          });
      }
    }
  });    
  
});

// 세션 시작일시를 기록한다.
// url: /api/v1/log/session/starttime 
router.post('/log/starttime', function (req, res) {

  var inputs = {
    user_id: req.user.user_id,
    training_user_id: parseInt(req.body.training_user_id),
    course_id: parseInt(req.body.course_id),
    course_list_id: parseInt(req.body.course_list_id)
  };

  var query = connection.query(QUERY.LOG_COURSE_LIST.INS_SESSION_PROGRESS, [
      inputs.user_id, 
      inputs.training_user_id,
      inputs.course_id, 
      inputs.course_list_id,
      inputs.user_id, 
      inputs.training_user_id,
      inputs.course_list_id     
    ], 
    function (err, data) {
      // //console.log(query.sql);
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

  // //console.log(query);

});

// 세션 시작일시를 기록한다.
// url: /api/v1/log/session/endtime 
router.post('/log/endtime', function (req, res) {

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