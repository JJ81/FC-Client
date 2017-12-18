const express = require('express');
const router = express.Router();
// const mySqlDbc = require('../commons/db_conn')();
// const connection = mySqlDbc.init();
const QUERY = require('../database/query');
const pool = require('../commons/db_conn_pool');
const async = require('async');
const util = require('../util/util');

// 이달의/지난 교육과정
router.get(['/current', '/passed'], util.isAuthenticated, util.isTermsApproved, util.getLogoInfo, (req, res, next) => {
  const {searchby, searchtext, page = 1} = req.query;
  // 이달/지난 교육의 경로를 세션에 저장한다.
  req.user.root_path = req.originalUrl;

  // req.url 에 따라 쿼리문을 달리한다.
  let query;
  // 완료/미완료 order (정렬순서) 가장 낮은 강의의 id
  let nextCourseId = null;
  // 완료/미완료 order (정렬순서) 가장 낮은 사용자 강의의 id
  let nextTrainingUserId = null;
  // 완료한 강의의 수
  let courseDoneCount = 0;
  let header, courses;
  let currentPath;

  if (req.path === '/current') {
    header = '이달의 교육과정';
    currentPath = 'current';
    query = QUERY.EDU.SEL_CURRENT;
  } else if (req.path === '/passed') {
    // query = QUERY.EDU.SEL_PASSED();
    // query = QUERY.EDU.SEL_PASSED('course', '운영');
    // query = QUERY.EDU.SEL_PASSED('month', '2017-03');
    header = '교육과정 검색';
    // header = '지난 교육과정';
    currentPath = 'passed';
    if (searchby != null && searchtext != null) {
      query = QUERY.EDU.SEL_PASSED(searchby, searchtext, page, 10);
    }
  }

  pool.getConnection((err, connection) => {
    if (err) throw err;
    async.series(
      [
        (callback) => {
          if (query) {
            connection.query(query,
              [ req.user.user_id, req.user.user_id ],
              (err, rows) => {
                // console.log(q.sql);
                if (err) {
                  callback(err, null);
                } else {
                  courses = rows;
                  // console.log(courses.length);
                  if (courses.length > 0) {
                    nextTrainingUserId = courses[0].training_user_id;
                    nextCourseId = courses[0].course_id;

                    for (i = 0; i < courses.length; i++) {
                      if (currentPath !== 'passed' || (currentPath === 'passed' && courses[i].can_replay === 1)) {
                        if (courses[i].completed_rate !== 100) {
                          nextTrainingUserId = courses[i].training_user_id;
                          nextCourseId = courses[i].course_id;
                          break;
                        }
                      }
                    }

                    // 완료하지 않은 강의의 수
                    for (var i = 0; i < courses.length; i++) {
                      if (courses[i].completed_rate === 100) {
                        courseDoneCount += 1;
                      }
                    }
                  }
                  callback(null, rows);
                }
              }
            );
          } else {
            callback(null, null);
          }
        },
        callback => { // results[1]
          connection.query('SELECT FOUND_ROWS() AS row_count; ',
            [],
            (err, data) => {
              callback(err, data);
            }
          );
        },
        // 지난 교육과정일 경우 검색을 위한 배정월 목록을 가져온다.
        callback => {
          if (currentPath === 'passed') {
            connection.query(QUERY.EDU.SEL_PASSED_EDU_MONTH,
                [ req.user.user_id ],
                (err, rows) => {
                  callback(err, rows);
                }
              );
          } else {
            callback(null, null);
          }
        }
      ],
      (err, results) => {
        connection.release();
        if (err) {
          console.error(err);
          throw new Error(err);
        } else {
          let pagination = {
            page: page,
            pageCount: Math.ceil(results[1][0].row_count / 10)
          };

          // console.log(pagination);

          res.render('education', {
            group_path: 'education',
            current_path: currentPath,
            current_url: req.url,
            req: req.get('origin'),
            loggedIn: req.user,
            header: header,
            courses: courses,
            month_list: results[2],
            next_training_user_id: nextTrainingUserId,
            next_course_id: nextCourseId,
            count_course_done: courseDoneCount,
            pagination: pagination,
            page: page,
            searchby: searchby,
            searchtext: searchtext
          });
        }
      });
  });
});

module.exports = router;
