
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
const PointService = require('../service/PointService');
const pool = require('../commons/db_conn_pool');
const util = require('../util/util');

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
  usernameField: 'phone',
  passwordField: 'password',
  passReqToCallback: true
}, (req, phone, password, done) => {
  connection.query(QUERY.AUTH.SEL_INFO, [phone], (err, data) => {
    if (err) {
      return done(null, false);
    } else {
      if (data.length === 1) {
        if (!bcrypt.compareSync(password, data[0].password)) {
          return done(null, false);
        } else {
          if (process.env.NODE_ENV === 'production') {
            const { mobile_url: mobileUrl } = data[0];
            console.log(mobileUrl);
            console.log(req.headers.host);
            if (mobileUrl !== req.headers.host) {
              return done(null, false, req.flash('로그인 메세지', '잘못된 접근입니다.'));
            }
          }

          // 사용자 포인트 조회
          // let userPoint = 0;
          let userInfo = {
            'user_id': data[0].id,
            'fc_id': data[0].fc_id,
            'name': data[0].name,
            'email': data[0].email,
            'point': data.point_total
          };

            // 교육생 포인트를 사이드탭에 표시하기 위함.
          PointService.userpoint(connection, { user_id: data[0].id, fc_id: data[0].fc_id }, (err, data) => {
            if (err) throw err;
            userInfo.point = data.point_total;
            return done(null, userInfo);
          });
        }
      } else {
        return done(null, false);
      }
    }
  });
}
));

// 로그인 화면
router.get('/login', util.getLogoInfo, (req, res, next) => {
  if (req.user == null) {
    res.render('login', {
      current_path: 'login'
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
    res.redirect('/education/current');
  });

// 로그아웃
router.get('/logout', util.isAuthenticated, (req, res) => {
  req.logout();
  res.redirect('/');
});

// 로그인 상태일 경우, 이달의 교육과정 메뉴로 이동
router.get('/', util.isAuthenticated, (req, res) => {
  res.redirect('/education/current');
});

router.get('/point', util.isAuthenticated, util.getLogoInfo, (req, res) => {
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

module.exports = router;
