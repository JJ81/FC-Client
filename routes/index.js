

/* express 설정 */
var express = require('express');
var router = express.Router();


/* DB 커넥션 객체 */
var mysql_dbc = require('../commons/db_conn')();
// DB 연결
var connection = mysql_dbc.init();
// DB 연결 테스트
mysql_dbc.test_open(connection);
// 쿼리 로드
var QUERY = require('../database/query');


// 프로젝트 속성
var PROJ_TITLE = "오렌지나무";

// 헬퍼 함수
require('../commons/helpers');

// 세션 플러그인
var flash = require('connect-flash');

// 암호화
var bcrypt = require('bcrypt');


// passport (인증모듈) 설정
// 참고 : http://bcho.tistory.com/920
var passport = require('passport');
// passport local strategy (id, pwd 형)
var LocalStrategy = require('passport-local').Strategy;

// 로그인이 성공하면 사용자 정보를 Session 에 저장
passport.serializeUser(function (user, done) {
  done(null, user);
});

// 로그인이 되어있는 상태에서, 모든 사용자 페이지 접근 시 발생
// 세션에서 사용자 profile 을 찾은 후 HTTP Request 로 리턴
passport.deserializeUser(function (user, done) {
  done(null, user);
});

// 사용자 로그인 여부 확인
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();

  // 로그인되어 있지 않을 경우 로그인 페이지로 이동
  res.redirect('/login');
};

// Local Strategy 에 의해 인증시 호출되는 인증 메서드 정의
passport.use(new LocalStrategy({
    usernameField: 'phone',
    passwordField: 'password',
  passReqToCallback: true
  }, function (req, phone, password, done) {
    connection.query(QUERY.AUTH.login, [phone], function (err, data) {
      if (err) {
        return done(null, false);
      } else {
        if (data.length === 1) {
          if (!bcrypt.compareSync(password, data[0].password)) {
            console.log('password is not matched.');
            return done(null, false);
          } else {
            console.log('password is matched.');
            console.log('여기까지 드렁오낭')
            return done(null, {
              'name' : data[0].name,
              'email' : data[0].email,
              'role' : data[0].role
            });
          }
        } else {
          return done(null, false);
        }
      }
    });
  }
));

router.get('/login', function (req, res) {
  if (req.user == null) {
    res.render('login', {
      current_path: 'login',
      title: PROJ_TITLE
    });
  } else {
    res.redirect('/home');
  }
});

router.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }), function (req, res) {
    res.redirect('/list');
  });

router.get('/logout', isAuthenticated, function (req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/', isAuthenticated, function (req, res) {
  res.redirect('/home');
});

router.get('/home', function (req, res) {
  res.render('home', {
    current_path: 'Home',
    title: PROJ_TITLE,
    loggedIn: req.user
  });
});

router.get('/list' ,function(req, res){
    var stmt = 'SELECT * FROM orangemanu.edu;';
    connection.query(stmt, function(err, result){
        if(err){
            console.log(err);
        }else{
            console.log(result)
            res.render('list',{
            current_path: 'asd',
                title: PROJ_TITLE,
                loggedIn: req.user,
                result: result
            });
        }
    })
});


module.exports = router;