
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

// DB 연결 테스트
mysql_dbc.test_open(connection);

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var bcrypt = require('bcrypt');


// 로그인이 성공하면 사용자 정보를 Session 에 저장
passport.serializeUser(function (user, done) {
  done(null, user);
});

// 로그인이 되어있는 상태에서, 모든 사용자 페이지 접근 시 발생
// 세션에서 사용자 profile 을 찾은 후 HTTP Request 로 리턴
passport.deserializeUser(function (user, done) {
  done(null, user);
});

// Local Strategy 에 의해 인증시 호출되는 인증 메서드 정의
passport.use(new LocalStrategy({
    usernameField: 'phone',
    passwordField: 'password',
    passReqToCallback: true
  }, function (req, phone, password, done) {
    connection.query(QUERY.AUTH.SEL_INFO, [phone], function (err, data) {
      if (err) {
        return done(null, false);
      } else {
        if (data.length === 1) {
          if (!bcrypt.compareSync(password, data[0].password)) {
            console.log('password is not matched.');
            return done(null, false);
          } else {
            console.log('password is matched.');
            return done(null, {
              'user_id': data[0].id,
              'fc_id': data[0].fc_id, 
              'name' : data[0].name,
              'email' : data[0].email
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
router.get('/login', function (req, res) {
  if (req.user == null) {
    res.render('login', {
      current_path: 'login',
      title: PROJ_TITLE      
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
  }), function (req, res) {
    res.redirect('/education/current');
  });

// 로그아웃
router.get('/logout', isAuthenticated, function (req, res) {
  req.logout();
  res.redirect('/');
});

// 로그인 상태일 경우, 이달의 교육과정 메뉴로 이동
router.get('/', isAuthenticated, function (req, res) {
  res.redirect('/education/current');
});

module.exports = router;