'use strict';

requirejs([
  'common'
],
  function (Util) {
    var $ = $ || window.$;
    var btnNextCourse = $('#btn_next_course');
    var nextCourseUrl = btnNextCourse.attr('href'); // 다음강의보기
    var btnCompleteCourse = $('#btn_complete_course');
    var rootUrl = btnCompleteCourse.attr('href');  // 처음으로
    var trainingUserId = btnCompleteCourse.data('training-user-id');
    var courseId = btnCompleteCourse.data('course-id');
    var courseGroupId = btnCompleteCourse.data('course-group-id');

    // 다음 강의 듣기
    btnNextCourse.on('click', function (event) {
      event.preventDefault();
      endTimeLogger(nextCourseUrl);
    });

    btnCompleteCourse.on('click', function (event) {
      event.preventDefault();
      endTimeLogger(rootUrl);
    });

    // 교육과정 시작시간 기록
    function endTimeLogger (locationUrl) {
      $.ajax({
        type: 'POST',
        url: '/course/log/end',
        data: {
          training_user_id: trainingUserId,
          course_id: courseId,
          course_group_id: courseGroupId
        }
      }).done(function (res) {
        if (!res.success) {
          console.error(res.msg);
        } else {
          console.info('교육과정 종료일시 기록');
          location.href = locationUrl;
        }
      });
    }
  }
);
