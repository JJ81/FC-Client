/**
 * Created by parkseokje
 * 이달의 교육
 */

'use strict';

requirejs(
  [
    'common'
  ],
function (Util) {
  var $ = $ || window.$;
  var sidenav = $('#navigation');
  var sideNavToggle = $('.nav_link');
  var exitToCourse = $('.exit_link'); // 강의보기 페이지로 이동
  var exitToPrev = $('.back_link'); // 이전 페이지로 이동
  var sideNavScreen = $('#bg_screen');

  // 사이트탭
  sideNavToggle.bind('click', function (e) {
    e.preventDefault();
    sidenav.toggleClass('blind');
    sideNavScreen.toggleClass('blind');
  });

  // 사이트탭 배경화면
  sideNavScreen.bind('click', function () {
    sidenav.toggleClass('blind');
    sideNavScreen.toggleClass('blind');
  });

  // 강의페이지로 나가기
  exitToCourse.bind('click', function (e) {
    if (!confirm('강의페이지로 이동하시겠습니까?')) { e.preventDefault(); }
  });
}
);
