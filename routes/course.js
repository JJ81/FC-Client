const express = require('express');
const router = express.Router();
const mySqlDbc = require('../commons/db_conn')();
const connection = mySqlDbc.init();
const QUERY = require('../database/query');
const async = require('async');
const util = require('../util/util');

/**
 * 강의 정보
 */
router.get('/:training_user_id/:course_id', util.isAuthenticated, util.getLogoInfo, (req, res, next) => {
  const { training_user_id: trainingUserId, course_id: courseId } = req.params;
  let minCourseListId = null; // 학습을 시작/반복/이어할 세션 id

  async.series([
    callback => {
      connection.query(QUERY.COURSE.SEL_INDEX, [trainingUserId, trainingUserId, courseId], (err, data) => {
        callback(err, data[0]);
      });
    },
    callback => {
      connection.query(QUERY.COURSE.SEL_SESSION_LIST, [req.user.user_id, trainingUserId, courseId], (err, data) => {
        callback(err, data);
      });
    },
    // edu_id, course_group_id 조회 (세션에 저장해둔다.)
    callback => {
      connection.query(QUERY.EDU.SEL_COURSE_GROUP, [trainingUserId], (err, data) => {
        callback(err, data);
      });
    }
  ],
  (err, results) => {
    if (err) {
      console.error(err);
    } else {
      // 교육과정id 와 강의그룹id 를 세션에 저장한다.
      req.user.edu_id = results[2][0].edu_id;
      req.user.course_group_id = results[2][0].course_group_id;

      // 학습하기 버튼 클릭 시 시작 세션 id를 구한다.
      // 기본은 id 가 가장 작은 세션이다.
      // 그 다음은 완료하지 않은 세션 중 id 가 가장 작은 세션이다.
      if (results[1].length !== 0) {
        minCourseListId = results[1][0].id;
        for (var i = 0; i < results[1].length; i++) {
          if (results[1][i].done !== 1) {
            minCourseListId = results[1][i].id;
            break;
          }
        }
      }

      // 강의뷰 출력
      res.render('course', {
        current_path: 'course',
        current_url: req.url,
        host: req.get('origin'),
        loggedIn: req.user,
        header: results[0].course_name,
        course: results[0],
        course_list: results[1],
        course_list_id: minCourseListId,
        training_user_id: trainingUserId,
        back_url: req.user.root_path,
        edu_name: results[2][0].edu_name
      });
    }
  });
});

/**
 * 강의 시작
 */
router.post('/log/start', util.isAuthenticated, util.getLogoInfo, (req, res, next) => {
  const _inputs = {
    trainingUserId: req.body.training_user_id,
    courseId: req.body.course_id,
    isrepeat: req.body.isrepeat,
    user_id: req.user.user_id
  };
  connection.beginTransaction((err) => {
    // 트렌젝션 오류 발생
    if (err) {
      return res.json({
        success: false,
        msg: err
      });
    }

    async.series([
      // 최초 학습시작 시 training_users 의 시작일시(start_dt)를 기록
      callback => {
        connection.query(QUERY.EDU.UPD_TRAINING_USER_START_DT, [
          _inputs.trainingUserId
        ],
          (err, data) => {
            callback(err, data);
          });
      },
      // 사용자별 강의 진행정보를 입력
      callback => {
        connection.query(QUERY.COURSE.INS_COURSE_PROGRESS, [
          _inputs.user_id,
          _inputs.trainingUserId,
          _inputs.courseId,
          _inputs.trainingUserId,
          _inputs.courseId
        ],
          (err, data) => {
            callback(err, data);
          }
        );
      },
      // 사용자별 강의 반복횟수 갱신
      callback => {
        if (_inputs.isrepeat) {
          connection.query(QUERY.COURSE.UPD_COURSE_PROGRESS_REPEAT, [
            _inputs.trainingUserId,
            _inputs.courseId
          ],
            (err, data) => {
              callback(err, data);
            }
          );
        } else {
          callback(null, null);
        }
      }
    ], (err, results) => {
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
 * 강의 종료
 * 1. 강의 종료일시 기록
 * 2. 강의 종료여부 조회
 * 3. 교육 종료여부 기록
 * 4. 교육이수여부, 교육과정 이수속도를 포인트 결과에 반영
 */
router.post('/log/end', util.isAuthenticated, (req, res) => {
  const inputs = {
    trainingUserId: req.body.training_user_id,
    courseId: req.body.course_id,
    courseGroupId: req.body.course_group_id
  };

  let courseEndYn = null;

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
      callback => {
        // 강의 종료일시 기록
        connection.query(QUERY.COURSE.UPD_COURSE_PROGRESS, [
          inputs.trainingUserId,
          inputs.courseId
        ],
          (err, data) => {
            callback(err, data);
          }
        );
      },
      callback => {
        // 강의 종료여부 조회
        connection.query(QUERY.COURSE.SEL_COURSE_END, [
          inputs.courseGroupId,
          inputs.trainingUserId
        ],
          (err, data) => {
            if (data.length === 0) {
              courseEndYn = true;
            }
            callback(err, data);
          }
        );
      },
      callback => {
        // 교육 종료여부 기록
        if (courseEndYn) {
          connection.query(QUERY.EDU.UPD_TRAINING_USER_END_DT, [
            inputs.trainingUserId
          ],
            (err, data) => {
              // console.log(query.sql);
              callback(err, data);
            }
          );
        } else {
          callback(null, null);
        }
      }
    ], (err, results) => {
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
          // 커밋 오류
          if (err) {
            return connection.rollback(() => {
              res.json({
                success: false,
                msg: err
              });
            });
          }

          res.json({
            success: true
          });
        });
      }
    });
  });
});

router.get('/check', (req, res, next) => {
  const { training_user_id: trainingUserId, course_id: courseId } = req.query;
  let courseGroupId;
  let prevCourseId;
  let eduName;
  let prevCourseName;
  let canProceed;
  let canAdvance = 0; // 강의 선진행 여부

  async.series([
    callback => {
      connection.query(QUERY.EDU.SEL_COURSE_GROUP, [trainingUserId], (err, data) => {
        console.log(data);
        if (data !== null) {
          courseGroupId = data[0].course_group_id;
          canAdvance = data[0].can_advance;
          eduName = data[0].edu_name;
        }
        callback(err, data);
      });
    },
    callback => {
      if (canAdvance !== 1) {
        console.log('prev_course id 조회');
        connection.query(QUERY.COURSE.GetPrevCourseId, [ courseId, courseGroupId ], (err, data) => {
          if (data !== null) {
            prevCourseId = data[0].prev_course_id;
          }
          callback(err, data);
        });
      } else {
        callback(null, null);
      }
    },
    // callback => {
    //   if (prevCourseId === courseId) {
    //     console.log('prev_course id 재조회');
    //     connection.query(QUERY.COURSE.GetPrevCourseId2, [ courseId, courseGroupId ], (err, data) => {
    //       if (data !== null) {
    //         prevCourseId = data[0].prev_course_id;
    //       }
    //       callback(err, data);
    //     });
    //   } else {
    //     callback(null, null);
    //   }
    // },
    callback => {
      if (canAdvance !== 1) {
        console.log('prev_course 학습여부 조회', prevCourseId);
        if (prevCourseId === 0) {
          canProceed = true;
          callback(null, null);
        } else {
          connection.query(QUERY.COURSE.GetCourseDone, [ trainingUserId, prevCourseId ], (err, data) => {
            if (data !== undefined) {
              if (data[0].end_dt !== null) {
                canProceed = true;
              }
            }

            prevCourseName = data[0].course_name;
            console.log(prevCourseName);
            callback(err, data);
          });
        }
      } else {
        canProceed = true;
        callback(false, false);
      }
    }
  ],
  (err, results) => {
    if (err) {
      console.error(err);
    } else {
      res.send({
        success: true,
        can_progress: canProceed === true ? 1 : 0,
        eduName: eduName,
        prev_course_name: prevCourseName !== '' ? prevCourseName : ''
      });
    }
  });
});

module.exports = router;
