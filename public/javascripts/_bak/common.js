/**
 * Created by yijaejun on 9/3/16.
 */
// var
//   reg_func = null, // 검사할 기능을 담을 공간
//   message = [], // 출력 메시지
//   error = [],
//   pwRules = {}; // 에러 메시지
//
// var spec = {
//   sizeLimit: 8,
//   wildLetter: true,
//   upperLetter: true,
//   digitLetter: true
// };
//
// function isValidEmail(email) {
//   var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//   return re.test(email);
// }
//
// // check password length
// function checkPasswordSize(pass) {
//   if (pass.length >= spec.sizeLimit) {
//     return true;
//   }
//   return false;
// }
//
// // check password contains digit
// function checkContainDigit(pass) {
//   if (pass.search(/[0-9]/) != -1) {
//     return true;
//   }
//   return false;
// }
//
// // check password contains wild card character
// function isContainWildLetter(pass) {
//   if (pass.search(/[`~!@@#$%^&*|₩₩₩'₩";:₩/?]/gi) != -1) {
//     return true;
//   }
//   return false;
// }
//
// // check if it contains uppercase or not
// function isContainUppercaseLetter(pass) {
//   if (pass.search(/[A-Z]/) != -1) {
//     return true;
//   }
//   return false;
// }
'use strict';
requirejs(
  [
    'jquery'
  ],
  function ($) {
    var code = $('#agent-code');


    $(document).on('click', '.get-current-balance', function () {
      getCurrentBalance(code);
    });



    /**
     * 해당 agent의 current balance 값을 가져온다
     */
    function getCurrentBalance(code) {

      $.ajax({
        url: '/api/v1/agent/get/current/balance?code='+code.val().trim(),
        type: 'get',
        success: function (data, textStatus , jqXHR) {
          $("#navbar-custom-menu").load(location.href + " #navbar-custom-menu>*", ""); //comment list reload
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.log(errorThrown);
        }
      })
    }

  });



