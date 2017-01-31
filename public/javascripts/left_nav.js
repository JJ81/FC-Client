/**
 * Created by parkseokje
 * 이달의 교육
 */

'use strict';

requirejs(
    [
        'jquery'
    ],
    function (jQuery) {

        var $ = jQuery,
            sidenav = $('#navigation'),
            sidenav_toggle = $('.nav_link'),
            exit_to_course = $('.exit_link'), // 강의보기 페이지로 이동
            sidenav_screen = $('#bg_screen');
        
        // 사이트탭
        sidenav_toggle.bind('click', function (e) {
            e.preventDefault();

            sidenav.toggleClass('blind');
            sidenav_screen.toggleClass('blind');
        });

        // 사이트탭 배경화면
        sidenav_screen.bind('click', function () {
            sidenav.toggleClass('blind');
            sidenav_screen.toggleClass('blind');            
        });
    }
);
