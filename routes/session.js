const express = require('express');
const router = express.Router();
const mysqlDbc = require('../commons/db_conn')();
const connection = mysqlDbc.init();
const QUERY = require('../database/query');
const async = require('async');
const CourseService = require('../service/CourseService');
const PointService = require('../service/PointService');
const VideoService = require('../service/VideoService');
const util = require('../util/util');

/**
 * 세션 학습시작
 */
router.get('/:training_user_id/:course_id/:course_list_id', util.isAuthenticated, util.getLogoInfo, (req, res, next) => {
  // console.log('req.params:', req.params);

  // IE의 경우 nplayer_control.html 로드 시 본 라우트가 다시 호출된다. 이를 방지하기 위함
  if (isNaN(parseInt(req.params.course_list_id))) {
    return res.sendStatus(200);
  }

  const {
    training_user_id: trainingUserId,
    course_id: courseId,
    course_list_id: courseListId
  } = req.params;

  let returnData = {
    group_path: 'contents',
    current_url: req.url,
    host: req.get('origin'),
    loggedIn: req.user,
    training_user_id: trainingUserId,
    course_id: courseId,
    course_list_id: courseListId
  };

  let courseList;
  let videoType; // vimeo / aqua(pc, mobile)

  // console.log('trainingUserId', trainingUserId);
  // console.log('courseListId', courseListId);

  async.series([
    // 강의정보 조회
    // results[0]
    (callback) => {
      connection.query(QUERY.COURSE_LIST.SEL_INDEX, [trainingUserId, courseListId], (err, data) => {
        console.log(data);
        courseList = data[0];

        // console.log('courseList ::', courseList);
        callback(err, data);
      });
    },
    // 세션 (비디오/퀴즈/파이널테스트) 정보 조회
    // results[1]
    (callback) => {
      switch (courseList.type) {
      case 'VIDEO':
        connection.query(QUERY.COURSE_LIST.SEL_VIDEO, [courseList.video_id], (err, data) => {
          videoType = data[0].video_type;
          callback(err, data);
        });
        break;

      case 'CHECKLIST':
        connection.query(QUERY.COURSE_LIST.GetChecklistByCourseListId, [courseList.id], (err, data) => {
          if (data.length > 0) {
            for (let i = 0; i < data.length; i++) {
              if (data[i].item_type !== 'write' && data[i].sample !== '') {
                data[i].sample = data[i].sample.split(',');
              }
            }
          }
          callback(err, data);
        });
        break;

      default: // QUIZ / FINAL
        connection.query(QUERY.COURSE_LIST.GetQuizDataByGroupId, [ courseList.quiz_group_id ], (err, data) => {
          callback(err, data); // results[1]
        });
        break;
      }
    },
    // (비디오 세션일 경우에만 해당) 비디오 총 시청시간 조회
    // results[2]
    (callback) => {
      if (courseList.type === 'VIDEO') {
        connection.query(QUERY.LOG_VIDEO.SEL_TOTAL_VIDEO_PLAYTIME, [
          req.user.user_id,
          trainingUserId,
          courseList.video_id
        ], (err, data) => {
          callback(err, data);
        });
      } else {
        callback(null, null);
      }
    },
    // 비디오 마지막 재생시점을 가져온다.
    // results[3]
    callback => {
      if (courseList.type === 'VIDEO') {
        connection.query(QUERY.LOG_VIDEO.SEL_LAST_VIDEO_CURRENT_TIME, [
          req.user.user_id,
          trainingUserId,
          courseList.video_id
        ], (err, data) => {
          callback(err, data);
        });
      } else {
        callback(null, null);
      }
    },
    // 비디오 세션의 종료여부를 가져온다.
    // results[4]
    callback => {
      if (courseList.type === 'VIDEO') {
        connection.query(QUERY.LOG_COURSE_LIST.SEL_SESSION_PROGRESS, [
          req.user.user_id,
          trainingUserId,
          courseListId
        ], (err, data) => {
          callback(err, data);
        });
      } else {
        callback(null, null);
      }
    }
  ],
  (err, results) => {
    if (err) {
      console.error(err);
    } else {
      // 다음으로 버튼 클릭시 이동할 페이지
      // var rootPath = '/' + req.path.split('/')[1];
      var nextUrl = null;

      // 다음 URL 을 설정한다.
      if (courseList.next_id) {
        nextUrl = '/' + 'session' + '/' + trainingUserId + '/' + courseId + '/' + courseList.next_id;
      } else {
        nextUrl = '/' + 'evaluate' + '/' + trainingUserId + '/' + courseId;
      }

      // 비디오뷰 출력
      if (courseList.type === 'VIDEO') {
        var currenttime = 0;
        var deviceType = req.device.type.toUpperCase();

        if (results[3][0] != null) { currenttime = results[3][0].currenttime; }

        switch (videoType) {
        case 'aqua':
          if (deviceType === 'PHONE') {
            returnData.current_path = 'aqua-mobile';
          } else if (deviceType === 'DESKTOP') {
            returnData.current_path = 'aqua-desktop';
          }
          break;

        default:
          returnData.current_path = videoType;
          break;
        }

        returnData.content = results[1][0];
        returnData.currenttime = currenttime;
        returnData.video_url = res.locals.vodPcUrl + returnData.content.url;
        returnData.watermark = req.user.user_id;
        returnData.total_played_seconds = results[2][0].total_played_seconds;
        returnData.setting = {
          interval: 10, // playtime 로깅 간격
          waiting_seconds: 30, // 비디오 종료 후 다음 버튼이 노출되는 시간
          passive_rate: 80 // 다음 버튼이 활성화되는 시청시간 (%)
        };
        returnData.header = courseList.title;
        returnData.next_url = nextUrl;
        returnData.training_user_id = trainingUserId;
        returnData.course_id = courseId;
        returnData.course_list_id = courseListId;

        if (videoType === 'vimeo') {
          res.render('video', returnData);
        } else if (videoType === 'aqua') {
          const { autoplay = true } = req.query;

          returnData.autoplay = autoplay; // 비디오 자동 재생
          returnData.status = 'progress';
          returnData.confirm = 0;

          if (returnData.total_played_seconds > 0) {
            if (Math.floor(results[2][0].max_duration * 0.8) <= returnData.total_played_seconds) {
              returnData.status = 'done';

              // 모바일 기기에서 전송된 경우
              if (req.header('Referer') === undefined) {
                if (results[4][0].end_dt === null) {
                  returnData.confirm = 1;
                }
              }
            }
          }

          // console.log('returnData:', JSON.stringify(returnData, null, 2));

          switch (req.device.type.toUpperCase()) {
          case 'DESKTOP':
            console.log('video_pc');
            res.render('video_pc', returnData);
            break;

          case 'PHONE':
            console.log('video_aqua');
            res.render('video_aqua', returnData);
            break;

          default:
            break;
          }
        }
      } else if (courseList.type === 'QUIZ' || courseList.type === 'FINAL') {
        var quizList = CourseService.makeQuizList(results[1]);

        returnData.current_path = 'quiz';
        returnData.contents = quizList;
        returnData.prev_yn = courseList.prev_yn;
        returnData.header = courseList.title;
        returnData.next_url = nextUrl;
        res.render('quiz', returnData);
      } else if (courseList.type === 'CHECKLIST') {
        returnData.current_path = 'checklist';
        returnData.contents = results[1];
        returnData.header = courseList.title;
        returnData.description = courseList.desc;
        returnData.next_url = nextUrl;
        returnData.checklist_group_id = courseList.checklist_group_id;
        res.render('checklist', returnData);
      }
    }
  });
});

/**
 * AquaPlayer의 return url 요청을 처리할 route
 * 세션 유지 됨
 */
// router.get('/player/check/:training_user_id/:course_id/:course_list_id/:video_id/:video_status', (req, res, next) => {
//   const inputs = {
//     user_id: parseInt(req.user.user_id),
//     training_user_id: parseInt(req.params.training_user_id),
//     course_id: parseInt(req.params.course_id),
//     course_list_id: parseInt(req.params.course_list_id),
//     video_id: parseInt(req.params.video_id),
//     video_status: req.params.video_status
//   };

//   VideoService.CheckPlayTime(inputs, (err, data) => {
//     if (err) throw err;
//     if (data.passive === true) {
//       return res.redirect(
//         `/session/${inputs.training_user_id}/${inputs.course_id}/${inputs.course_list_id}`);
//     }
//   });
// });

/**
 * AquaPlayer의 bookmark data 를 처리할 route
 * 세션 유지 안됨
 */
router.post('/player/log/:user_id/:training_user_id/:course_id/:course_list_id/:video_id/:total_played_seconds', (req, res, next) => {
  const inputs = {
    user_id: parseInt(req.params.user_id),
    training_user_id: parseInt(req.params.training_user_id),
    video_id: parseInt(req.params.video_id),
    played_seconds: parseInt(req.body.TM) / 1000, // 재생시작 이후 누적 재생시간 (예: 1.6 배속으로 10 초 재생시 16 으로 계산, ms 단위)
    video_duration: parseInt(req.body.cl) / 1000, // 컨텐츠의 총 길이
    currenttime: parseInt(req.body.pos) / 1000, // 재생중인 강의의 위치
    total_played_seconds: parseInt(req.params.total_played_seconds), // 로그 직전 총 재생시간
    pos_type: req.body.pos_type
  };

  // console.log(req.body);
  // console.log('----------------');
  // console.log(req.params);
  // console.log('----------------');

  // req, del => 북마크 신규, 삭제
  if (inputs.pos_type !== 'reg' && inputs.pos_type !== 'del') {
    // console.log(inputs);

    VideoService.logPlayTime(inputs, (err, data) => {
      if (err) throw err;
      return res.sendStatus(200);
    });
  } else if (inputs.pos_type === 'reg') {

  } else if (inputs.pos_type === 'del') {

  }
});

// 세션 시작일시를 기록한다.
// url: /api/v1/log/session/starttime
router.post('/log/starttime', util.isAuthenticated, (req, res) => {
  // console.log('req.body:', req.body);
  const inputs = {
    user_id: req.user.user_id,
    training_user_id: parseInt(req.body.training_user_id),
    course_id: parseInt(req.body.course_id),
    course_list_id: parseInt(req.body.course_list_id)
  };
  async.series([
    // 로그를 조회한다.
    (callback) => {
      connection.query(QUERY.LOG_COURSE_LIST.SEL_SESSION_PROGRESS, [
        inputs.user_id,
        inputs.training_user_id,
        inputs.course_list_id
      ],
    (err, data) => {
      callback(err, data);
    });
    },
    (callback) => {
      connection.query(QUERY.LOG_COURSE_LIST.INS_SESSION_PROGRESS, [
        inputs.user_id,
        inputs.training_user_id,
        inputs.course_id,
        inputs.course_list_id
        // inputs.user_id,
        // inputs.training_user_id,
        // inputs.course_list_id
      ],
      (err, data) => {
        callback(err, data);
      });
    }
  ],
  (err, results) => {
    let hadEnded = false; // 세션 종료 여부
    if (results[0][0]) { hadEnded = (results[0][0].end_dt !== null); }

    if (err) {
      // 쿼리 실패
      res.json({
        success: false,
        msg: err
      });
    } else {
      // 쿼리 성공
      res.json({
        success: true,
        hasEnded: hadEnded
      });
    }
  });
});

/**
 * 세션 종료일시를 기록한다.
 * 포인트를 갱신한다. V
 */
router.post('/log/endtime', util.isAuthenticated, (req, res) => {
  const _inputs = {
    user_id: req.user.user_id,
    training_user_id: parseInt(req.body.training_user_id),
    course_id: parseInt(req.body.course_id),
    course_list_id: parseInt(req.body.course_list_id),
    course_list_type: req.body.course_list_type
  };

  connection.query(QUERY.LOG_COURSE_LIST.UPD_SESSION_PROGRESS, [
    _inputs.user_id,
    _inputs.training_user_id,
    _inputs.course_list_id
  ],
    (err, data) => {
      if (err) {
        // 쿼리 실패
        res.json({
          success: false,
          msg: err
        });
      } else {
        // 쿼리 성공
        PointService.save(connection,
          { user: req.user, training_user_id: _inputs.training_user_id },
          (err, data) => {
            if (err) {
              console.log(err);
            }
            res.json({
              success: true
            });
          }
        );
      }
    }
  );
});

// 세션 로그를 삭제한다/
router.delete('/log', util.isAuthenticated, (req, res) => {
  const inputs = {
    user_id: req.user.user_id,
    training_user_id: req.query.training_user_id,
    course_list_id: req.query.course_list_id
  };

  connection.query(QUERY.LOG_COURSE_LIST.INIT_SESSION_PROGRESS, [
  // connection.query(QUERY.LOG_COURSE_LIST.DEL_SESSION_PROGRESS, [
    inputs.user_id,
    inputs.training_user_id,
    inputs.course_list_id
  ],
    (err, data) => {
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
