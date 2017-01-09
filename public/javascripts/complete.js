
/**
 * 강의완료
 * TODO
 * 1. 최초 학습완료 시 training_users INSERT 및 종료일시(end_dt)를 기록하여야 한다.
 */


'use strict';

requirejs([
    'jquery'
  ],
  function (jQuery) {

    var $ = jQuery,
        btn_next_course = $('#btn_next_course'),
        next_course_url = btn_next_course.attr('href'), // 다음강의보기
        btn_complete_course = $('#btn_complete_course'),
        root_url = btn_complete_course.attr('href'),  // 처음으로
        training_user_id = btn_complete_course.data('training-user-id'),
        course_id = btn_complete_course.data('course-id'),
        course_group_id = btn_complete_course.data('course-group-id');

    // 다음 강의 듣기
    btn_next_course.on('click', function (event) {
      event.preventDefault();
      
      endTimeLogger();
      location.href = next_course_url;        
    });

    btn_complete_course.on('click', function (event) {
      event.preventDefault();
      
      endTimeLogger();
      location.href = root_url;        
    });  
    
    // 교육과정 시작시간 기록
    function endTimeLogger () {
      
      $.ajax({   
        type: "POST",
        url: "/course/log/end",
        data: { 
          training_user_id: training_user_id, 
          course_id: course_id, 
          course_group_id: course_group_id 
        } 
      }).done(function (res) { 
        if (!res.success) {
          console.error(res.msg);
        } else {
          console.info('교육과정 종료일시 기록');
        } 
      });
      
    }  

  }
);
    