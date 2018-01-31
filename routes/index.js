
const express = require('express');
const router = express.Router();
const mySqlDbc = require('../commons/db_conn')();
const connection = mySqlDbc.init();
const QUERY = require('../database/query');
// require('../commons/helpers');

// DB 연결 테스트
// mysql_dbc.test_open(connection);

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
// const PointService = require('../service/PointService');
const pool = require('../commons/db_conn_pool');
const util = require('../util/util');
const validator = require('validator');

// 로그인이 성공하면 사용자 정보를 Session 에 저장
passport.serializeUser((user, done) => {
  done(null, user);
});

// 로그인이 되어있는 상태에서, 모든 사용자 페이지 접근 시 발생
// 세션에서 사용자 profile 을 찾은 후 HTTP Request 로 리턴
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Local Strategy 에 의해 인증시 호출되는 인증 메서드 정의
passport.use(new LocalStrategy({
  usernameField: 'cell',
  passwordField: 'password',
  passReqToCallback: true
}, (req, phone, password, done) => {
  if (!validator.isLength(phone, { min: 10, max: 11 })) {
    return done(null, false, { message: '잘못된 핸드폰 형식입니다.' });
  }
  connection.query(QUERY.AUTH.SEL_INFO, [phone], (err, data) => {
    if (err) {
      return done(null, false, { message: '오류가 발생하였습니다.' });
    } else {
      if (data.length === 1) {
        if (!bcrypt.compareSync(password, data[0].password)) {
          return done(null, false, { message: '잘못된 암호입니다.' });
        }

        if (data[0].fc_active === 0) {
          return done(null, false, { message: '접속할 수 없는 계정입니다.' });
        }

        if (process.env.NODE_ENV === 'production') {
          const { mobile_url: mobileUrl } = data[0];

          console.log(mobileUrl, req.headers.host);

          if (mobileUrl !== req.headers.host) {
            return done(null, false, { message: '등록되지 않은 핸드폰 번호입니다.' });
          }
        }

        if (data[0].active !== 1) {
          return done(null, false, { message: '일치하는 정보가 없습니다.' });
        }

        // 사용자 포인트 조회
        // let userPoint = 0;
        let userInfo = {
          'user_id': data[0].id,
          'fc_id': data[0].fc_id,
          'name': data[0].name,
          'branch': data[0].branch_name,
          'duty': data[0].duty_name,
          'email': data[0].email,
          // 'point': data.point_total,
          'terms_approved': data[0].terms_approved,
          'isdemo': data[0].isdemo
        };

          // 교육생 포인트를 사이드탭에 표시하기 위함.
        return done(null, userInfo);
          // PointService.userpoint(connection, { user_id: data[0].id, fc_id: data[0].fc_id }, (err, data) => {
          //   if (err) throw err;
          //   userInfo.point = data.point_total;
          //   return done(null, userInfo);
          // });
      } else {
        return done(null, false, { message: '등록되지 않은 핸드폰 번호입니다.' });
      }
    }
  });
}
));

// 로그인 화면
router.get('/login', util.getLogoInfo, (req, res, next) => {
  if (req.user == null) {
    // console.log(req.flash('error')[0]);
    res.render('login', {
      current_path: 'login',
      message: req.flash('error')[0]
    });
  } else {
    res.redirect('/education/current');
  }
});

// 로그인 처리
router.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }), (req, res) => {
    if (req.user.terms_approved === 0) {
      res.redirect('/terms');
    } else {
      res.redirect('/education/current');
    }
  });

// 로그아웃
router.get('/logout', util.isAuthenticated, (req, res) => {
  req.logout();
  res.redirect('/');
});

// 로그인 상태일 경우, 이달의 교육과정 메뉴로 이동
router.get('/', util.isAuthenticated, util.isTermsApproved, (req, res) => {
  res.redirect('/education/current');
});

router.get('/point', util.isAuthenticated, util.isTermsApproved, util.getLogoInfo, (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query(QUERY.POINT.GetUserPointDetails,
      [
        req.user.fc_id,
        req.user.user_id
      ],
      (err, data) => {
        connection.release();

        if (err) {
          console.log(err);
          res.json({
            success: false,
            msg: err
          });
        } else {
          let list = [];
          for (let index = 0; index < data.length; index++) {
            let item = {};
            let logs = JSON.parse(data[index].logs);
            // let item = JSON.parse(data[index].logs);

            item.edu_name = logs.edu_name;
            // item.point_complete = data[index].point_complete;
            // item.point_quiz = data[index].point_quiz;
            // item.point_final = data[index].point_final;
            // item.point_reeltime = data[index].point_reeltime;
            // item.point_speed = data[index].point_speed;
            // item.point_repetition = data[index].point_repetition;
            item.point_total = data[index].point_total;
            item.start_dt = data[index].start_dt;
            item.end_dt = data[index].end_dt;

            list.push(item);
          }
          res.render('point', {
            current_path: 'point',
            req: req.get('origin'),
            loggedIn: req.user,
            header: '포인트 현황',
            list: list
          });
        }
      }
    );
  });
});

// 로그인 상태일 경우, 이달의 교육과정 메뉴로 이동
router.get('/video-quick-icon', util.getLogoInfo, (req, res, next) => {
  res.render('video_quick_icon', {
    current_path: 'quickicon',
    header: '바로가기 추가'
  });
});

router.get('/terms', util.isAuthenticated, util.getLogoInfo, (req, res, next) => {
  const content = `

본인은 가맹사업법에 따른 가맹점 사업자로서,

가맹본부가 제공하는 학습내용을 타인에게 유출하거나

계약범위 이외의 목적으로 활용하지 않겠습니다.

이를 위반 시 가맹사업법 위반 행위로서 민형사상

불이익이 발생할 수 있음을 인지하였습니다.
  `;

  res.render('terms', {
    current_path: 'terms',
    header: '비밀유지 서약서',
    loggedIn: req.user,
    content: content
  });
});

router.post('/terms', util.isAuthenticated, (req, res, next) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query(QUERY.AUTH.UPD_CHANGE_TERMS,
      [
        1,
        req.user.user_id
      ],
      (err, data) => {
        connection.release();

        if (err) {
          console.log(err);
          res.json({
            success: false,
            msg: err
          });
        } else {
          req.user.terms_approved = 1;
          res.redirect('/education/current');
        }
      }
    );
  });
});

router.get('/notice', util.isAuthenticated, util.getLogoInfo, (req, res, next) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;

    connection.query(QUERY.BOARD.Select, [ req.user.fc_id ], (err, result) => {
      connection.release();

      if (err) {
        console.log(err);
        res.status(500).json({
          success: false,
          msg: err
        });
      } else {
        res.render('notice', {
          current_path: 'notice',
          header: '공지사항',
          loggedIn: req.user,
          list: result
        });
      }
    });
  });
});

router.get('/notice/:id', util.isAuthenticated, util.getLogoInfo, (req, res, next) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;

    connection.query(QUERY.BOARD.SelectDetail, [ req.params.id ], (err, result) => {
      connection.release();

      if (err) {
        console.log(err);
        res.status(500).json({
          success: false,
          msg: err
        });
      } else {
        const notice = result[0];

        if (notice.file_name) {
          const key = notice.file_name.substring(notice.file_name.lastIndexOf('/') + 1);
          notice.url = key;
        }

        // notice.url = `/api/v1/s3-download?key=${key}`;

        res.render('notice-detail', {
          current_path: 'notice',
          header: '공지사항',
          loggedIn: req.user,
          notice: notice
        });
      }
    });
  });
});

router.get('/notice', util.isAuthenticated, util.getLogoInfo, (req, res, next) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;

    connection.query(QUERY.BOARD.Select, [ req.user.fc_id ], (err, result) => {
      connection.release();

      if (err) {
        console.log(err);
        res.status(500).json({
          success: false,
          msg: err
        });
      } else {
        res.render('notice', {
          current_path: 'notice',
          header: '공지사항',
          loggedIn: req.user,
          list: result
        });
      }
    });
  });
});

router.get('/help', util.isAuthenticated, util.getLogoInfo, (req, res, next) => {
  const deviceType = req.device.type.toUpperCase();
  let videoUrl;

  if (deviceType === 'DEKTOP') {
    videoUrl = 'http://pcst.aquan.dev.edu1004.kr/orangenamu/dev/onm_orange_user.mp4';
  } else {
    videoUrl = 'http://mst.aquan.dev.edu1004.kr/orangenamu/dev/onm_orange_user.mp4';
  }

  res.render('help', {
    header: '도움말',
    loggedIn: req.user,
    current_path: 'help',
    video_url: videoUrl,
    watermark: req.user.user_id,
    device_type: deviceType
  });
});

module.exports = router;
