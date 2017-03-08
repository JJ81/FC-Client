
var express = require('express');
var router = express.Router();
var mysql_dbc = require('../commons/db_conn')();
var connection = mysql_dbc.init();
var QUERY = require('../database/query');
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
};
require('../commons/helpers');
var bcrypt = require('bcrypt');

router.get('/', isAuthenticated, function (req, res) {
  var hostName = req.headers.host;
  var logoName = null;
  var logoImageName = null;

  logoName = hostName.split('.')[1];
  logoName = logoName === undefined ? 'orangenamu' : logoName;
  logoImageName = logoName + '.png';

  res.render('profile', {
    current_path: 'profile',
    current_url: req.url,
    logo: logoName,
    logo_image: logoImageName,
    title: global.PROJ_TITLE,
    host: req.get('origin'),
    loggedIn: req.user,
    header: '정보수정'
  });
});

// 비밀번호를 변경합니다.
router.post('/reset-password', isAuthenticated, function (req, res) {
  var inputs = {
    user_id: req.user.user_id,
    pwd: req.body.pass,
    pwd_confirm: req.body.re_pass
  };

  if (inputs.pwd !== inputs.pwd_confirm) {
    res.json({
      success: false,
      msg: '비밀번호가 일치하지 않습니다.'
    });
    return false;
  }

  // 비밀번호 해쉬화
  inputs.pwd = bcrypt.hashSync(inputs.pwd, 10);

  console.log(inputs.pwd);

  // 정보수정
  connection.query(QUERY.AUTH.UPD_CHANGE_PWD, [inputs.pwd, inputs.user_id], function (err, result) {
    if (err) {
      res.json({
        success: false,
        msg: err
      });
    } else {
      res.json({
        success: true
      });
    }
  });
});

// 이메일을 변경합니다.
router.post('/reset-email', isAuthenticated, function (req, res) {
  var inputs = {
    user_id: req.user.user_id,
    email: req.body.email
  };

  // 정보수정
  connection.query(QUERY.AUTH.UPD_CHANGE_EMAIL, [inputs.email, inputs.user_id], function (err, result) {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        res.json({
          success: false,
          msg: '중복되는 이메일이 존재합니다.'
        });
      }
    } else {
      res.json({
        success: true
      });
    }
  });
});

// 핸드폰을 변경합니다.
router.post('/reset-phone', isAuthenticated, function (req, res) {
  var inputs = {
    user_id: req.user.user_id,
    phone: req.body.phone
  };

  // 정보수정
  connection.query(QUERY.AUTH.UPD_CHANGE_PHONE, [inputs.phone, inputs.user_id], function (err, result) {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        res.json({
          success: false,
          msg: '중복되는 핸드폰 번호가 존재합니다.'
        });
      }
    } else {
      res.json({
        success: true
      });
    }
  });
});

module.exports = router;
