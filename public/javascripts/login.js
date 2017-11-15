/**
 * Created by yijaejun on 01/12/2016.
 */
'use strict';
requirejs(
  [
    'common',
    'jqueryCookie'
  ],
function (Util) {
  var $ = $ || window.$;
  var password = $('#password');  // 암호
  var phone = $('#phone'); // 핸드폰 번호
  var remember = $('#remember'); // 핸드폰 저장유무
  var btn_login = $('.btn_login'); // 로그인

        // 핸드폰 저장유무를 확인한다.
  checkCookie();

  /**
   * TODO 1. 쿠키를 저장한 사용자는 phone 값을 가져온다, 저장하지 않은 사용자는 가져오지 않는다
   * TODO 2. 쿠키를 저장한 사용자는 '핸드폰 번호 저장' 체크박스가 체크되있어야 한다. 저장하지 않은 사용자는 체크가 안되있어야 한다
   * TODO 3. 처음 '핸드폰 번호 저장'를 체크한 유저는 submit 클릭시 쿠키를 저장한다.
   * TODO 4. 쿠키 저장 사용자가 '핸드폰 번호 저장' 체크를 해제하면 쿠키 삭제 여부를 묻고 삭제 한다
   *
   * */
  btn_login.bind('click', function () {
    /* 쿠키 값이 없고, '핸드폰 번호 저장' checked 되있는 경우에 쿠키 값을 저장한다 */
    if ($.cookie('phone') === undefined && remember.hasClass('check_on')) {
      setCookie(phone.val());
    }
  });

  remember.bind('click', function () {
      // 체크박스 활성/비활성
    if ($(this).hasClass('check_on')) {
      $(this).removeClass('check_on');
      $(this).addClass('check_off');
    } else {
      $(this).removeClass('check_off');
      $(this).addClass('check_on');
    }

    if (!$(this).hasClass('check_on')) {
      if ($.cookie('phone') !== undefined) { /* 쿠키 값이 있고, '핸드폰 번호 저장' 이 체크 되있는 경우에 쿠키 삭제 가능 */
        removeCookie();
      }
    }
  });

  // 핸드폰 번호를 쿠키에 저장한다.
  function setCookie (phone) {
    $.cookie('phone', phone);
  }

  // 핸드폰 번호를 꺼내온다.
  function getCookie () {
    phone.val($.cookie('phone'));
  }

  // 핸드폰 저장유무를 확인하다.
  function checkCookie () {
    if ($.cookie('phone') === undefined) {
      remember.removeClass('check_on');
      remember.addClass('check_off');
    } else {
      remember.removeClass('check_off');
      remember.addClass('check_on');
      getCookie();
    }
  }

    // 쿠키를 제거한다.
  function removeCookie () {
    $.removeCookie('phone');
  }

  phone.bind('click', function (e) {
    window.$('.alert').hide();
  });

  password.bind('click', function (e) {
    window.$('.alert').hide();
  });
} // end of function
);
