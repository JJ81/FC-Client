
const express = require('express');
const router = express.Router();
const mysqlDbc = require('../commons/db_conn')();
const connection = mysqlDbc.init();
const QUERY = require('../database/query');
const bcrypt = require('bcrypt');
const util = require('../util/util');

router.get('/', util.isAuthenticated, util.isTermsApproved, util.getLogoInfo, (req, res, next) => {
  res.render('profile', {
    current_path: 'profile',
    current_url: req.url,
    host: req.get('origin'),
    loggedIn: req.user,
    header: '정보수정'
  });
});

// 비밀번호를 변경합니다.
router.post('/reset-password', util.isAuthenticated, (req, res, next) => {
  let inputs = {
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
  // 정보수정
  connection.query(QUERY.AUTH.UPD_CHANGE_PWD, [inputs.pwd, inputs.user_id], (err, result) => {
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
router.post('/reset-email', util.isAuthenticated, (req, res, next) => {
  var inputs = {
    user_id: req.user.user_id,
    email: req.body.email
  };

  // 정보수정
  connection.query(QUERY.AUTH.UPD_CHANGE_EMAIL, [inputs.email, inputs.user_id], (err, result) => {
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
router.post('/reset-phone', util.isAuthenticated, (req, res, next) => {
  var inputs = {
    user_id: req.user.user_id,
    phone: req.body.phone
  };

  // 정보수정
  connection.query(QUERY.AUTH.UPD_CHANGE_PHONE, [inputs.phone, inputs.user_id], (err, result) => {
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
