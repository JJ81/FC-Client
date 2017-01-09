/**
 * Created by parkseokje
 * 정보수정
 * TODO
 */

'use strict';

requirejs([
    'jquery'
  ],
  function (jQuery) {

    var $ = jQuery,
        phone = $('#phone'),
        btn_modify_phone = $('#btn_modify_phone'),
        email = $('#email'),
        btn_modify_email = $('#btn_modify_email'),
        password = $('#password'),
        password_confirm = $('#password_confirm'),
        btn_modify_password = $('#btn_modify_password');

    function isValidEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    }        

    function isNumber(s) {
      s += ''; // 문자열로 변환
      s = s.replace(/^\s*|\s*$/g, ''); // 좌우 공백 제거
      if (s == '' || isNaN(s)) return false;
      return true;
    }

    btn_modify_phone.on('click', function () {

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

      if(phone.val().length < 10 || phone.val().length > 11) {
        alert('최소 10자, 최대 11자까지 숫자로만 입력해주세요.');
        phone.select();
        return false;
      }

      $.ajax({   
        type: "POST",
        url: "/profile/reset-phone",
        data: { phone: phone.val() }   
      }).done(function (res) {   
        if (!res.success) {
          alert(res.msg);
          phone.select();
        }
        else {
          alert('핸드폰 번호를 변경하였습니다.');
          phone.val('');
        }
      });

    });        

    
    btn_modify_email.on('click', function () {
    
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
        type: "POST",
        url: "/profile/reset-email",
        data: { email: email.val() }   
      }).done(function (res) {   
        if (!res.success) {
          alert(res.msg);
          email.select();
        }
        else {
          alert('이메일을 변경하였습니다.');
          email.val('');
        }
      });

    });

    btn_modify_password.on('click', function () {
      
      if (!password.val()) {
        alert('비밀번호를 입력하세요.');
        password.focus();
        return false;
      }

      if (!password_confirm.val()) {
        alert('비밀번호 확인란을 입력하세요.');
        password_confirm.focus();
        return false;
      }

      $.ajax({   
        type: "POST",
        url: "/profile/reset-password",
        data: { pass: password.val(), re_pass: password_confirm.val() }   
      }).done(function (res) {   
        if (!res.success) {
          alert(res.msg);
          password_confirm.select();
        } else {
          alert('비밀번호를 변경하였습니다.');
          password.val('');
          password_confirm.val('');
        }
      });      

    });    
  }
);