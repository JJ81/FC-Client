/**
 * Created by parkseokje
 * 강의평가
 * TODO
 * 1. 강의/강사평가
 * 2. 평가 완료 후 완료페이지로 이동
 */

'use strict';

requirejs([
  'common',
  'jqueryRating'
], function (Util) {
  var $ = $ || window.$,
    btn_submit = $('.btn_submit'), // 평가 제출하기
    next_url = btn_submit.parent().attr('href'),
    course_id = btn_submit.data('course-id'),
    course_rating = $('.my-rating.course'), // 강의평가
    teacher_rating = $('.my-rating.teacher'); // 강사평가

  // http://nashio.github.io/star-rating-svg/demo/
  $('.my-rating').starRating({
    initialRating: 0,
    totalStars: 5,
    disableAfterRate: false,
    starShape: 'rounded',
    starSize: 30,
    emptyColor: '#000',
    hoverColor: '#4baf4d',
    activeColor: '#4baf4d',
    useGradient: false,
    readOnly: false,
    callback: function (currentRating, $el) {
      $el.attr('data-rating', currentRating);

      if ($el.hasClass('course')) {
        $('#course').val(currentRating);
      } else if ($el.hasClass('teacher')) {
        $('#teacher').val(currentRating);
      }
    }
  });

  // 제출하기
  btn_submit.on('click', function (e) {
    e.preventDefault();

    if (course_rating.attr('data-rating') === '' || teacher_rating.attr('data-rating') === '') {
      window.alert('평가부탁드립니다.');
      return false;
    }

    if (window.confirm('제출하시겠습니까?')) {
      ratingLogger();
    } else {
      return false;
    }
  });

  // 강의/강사평가 기록
  function ratingLogger () {
    $.ajax({
      type: 'POST',
      url: '/evaluate/log',
      data: {
        course_id: course_id,
        course_rating: course_rating.attr('data-rating'),
        teacher_rating: teacher_rating.attr('data-rating')
      }
    }).done(function (res) {
      if (!res.success) {
        console.error(res.msg);
      } else {
        window.location.href = next_url;
      }
    });
  }
});
