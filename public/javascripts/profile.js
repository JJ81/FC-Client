/**
 * Created by parkseokje
 * 정보수정
 * TODO
 */

'use strict';

requirejs([
  'common'
],
function (Util) {
  var $ = $ || window.$;
  var phone = $('#phone');
  var btnModifyPhone = $('#btn_modify_phone');
  var email = $('#email');
  var btnModifyEmail = $('#btn_modify_email');
  var password = $('#password');
  var passwordConfirm = $('#password_confirm');
  var btnModifyPassword = $('#btn_modify_password');

  function isValidEmail (email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  function isNumber (s) {
    s += ''; // 문자열로 변환
    s = s.replace(/^\s*|\s*$/g, ''); // 좌우 공백 제거
    if (s == '' || isNaN(s)) return false;
    return true;
  }

  btnModifyPhone.on('click', function () {
    if (!phone.val()) {
      alert('핸드폰 번호를 입력하세요.');
      phone.focus();
      return false;
    }

    if (!isNumber(phone.val())) {
      alert('숫자만 입력해주세요.');
      phone.select();
      return false;
    }

    if (phone.val().length < 10 || phone.val().length > 11) {
      alert('최소 10자, 최대 11자까지 숫자로만 입력해주세요.');
      phone.select();
      return false;
    }

    $.ajax({
      type: 'POST',
      url: '/profile/reset-phone',
      data: { phone: phone.val() }
    }).done(function (res) {
      if (!res.success) {
        alert(res.msg);
        phone.select();
      } else {
        alert('핸드폰 번호를 변경하였습니다.');
        phone.val('');
      }
    });
  });

  btnModifyEmail.on('click', function () {
    if (!email.val()) {
      alert('이메일을 입력하세요.');
      email.focus();
      return false;
    }

    if (!isValidEmail(email.val())) {
      alert('올바른 이메일을 입력하세요.');
      email.select();
      return false;
    }

    $.ajax({
      type: 'POST',
      url: '/profile/reset-email',
      data: { email: email.val() }
    })
    .done(function (res) {
      if (!res.success) {
        alert(res.msg);
        email.select();
      } else {
        alert('이메일을 변경하였습니다.');
        email.val('');
      }
    });
  });

  btnModifyPassword.on('click', function () {
    if (!password.val()) {
      alert('비밀번호를 입력하세요.');
      password.focus();
      return false;
    }

    if (!passwordConfirm.val()) {
      alert('비밀번호 확인란을 입력하세요.');
      passwordConfirm.focus();
      return false;
    }

    $.ajax({
      type: 'POST',
      url: '/profile/reset-password',
      data: { pass: password.val(), re_pass: passwordConfirm.val() }
    }).done(function (res) {
      if (!res.success) {
        alert(res.msg);
        passwordConfirm.select();
      } else {
        alert('비밀번호를 변경하였습니다.');
        password.val('');
        passwordConfirm.val('');
      }
    });
  });
});
