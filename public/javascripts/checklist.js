'use strict';

window.requirejs([
  'common'
],
function (Util) {
  var $ = $ || window.$;
  var $btnSumitAnswers = $('#btn_submit_answers'); // 제출하기 버튼
  var $btnPlay = $('#btn_play_next');
  var trainingUserId = $btnPlay.data('training-user-id');
  var courseId = $btnPlay.data('course-id');
  var courseListId = $btnPlay.data('course-list-id');
  var nextUrl = $btnPlay.attr('href');

  // var checklistGroupId = $btnPlay.data('checklist-group-id');

  // jquery load event
  $(function () {
    sessionProgressStartLogger();
  });

  $('[name*="sample-"]').click(function () {
    var $button = $(this).parent();
    var $buttonGroup = $button.parent();
    var $groupButtons = $buttonGroup.children().children($('[name*="sample-"]'));

    if ($button.hasClass('active')) {
      $(this).removeAttr('checked').prop('checked', false);
      $button.removeClass('active focus');
    } else {
      $button.addClass('active focus');
      $(this).attr('checked', 'checked').prop('checked', true);
      if ($buttonGroup.data('type') !== 'choose') {
        $groupButtons.not($(this)).removeAttr('checked').prop('checked', false).parent().removeClass('active focus');
      }
    }
  });

  // 세션 시작일시 로깅
  function sessionProgressStartLogger () {
    $.ajax({
      type: 'POST',
      url: '/session/log/starttime',
      data: {
        training_user_id: trainingUserId,
        course_id: courseId,
        course_list_id: courseListId
      }
    }).done(function (res) {
      if (!res.success) {
        console.error(res.msg);
      }
    });
  }

      // 세션 종료일시 로깅
  function sessionProgressEndLogger () {
    $.ajax({
      type: 'POST',
      url: '/session/log/endtime',
      data: {
        training_user_id: trainingUserId,
        course_id: courseId,
        course_list_id: courseListId
      }
    }).done(function (res) {
      if (!res.success) {
        console.error(res.msg);
      } else {
        window.location.href = nextUrl;
      }
    });
  }

  // 세션 종료로그를 기록한다.
  $btnPlay.on('click', function (e) {
    e.preventDefault();
    sessionProgressEndLogger();
  });

  $btnSumitAnswers.on('click', function (e) {
    e.preventDefault();

    var answers = [];
    var invalidInputCount = 0;

    $('.checklist-item').each(function (index) {
      var itemId = $(this).data('id');
      var itemType = $(this).data('type');
      var inputIsValid = true;

      switch (itemType) {
      case 'write':
        if ($(this).val() === '') {
          inputIsValid = false;
        }
        answers.push({
          id: itemId,
          answer: $(this).val()
        });
        break;

      default:
        var str = $(this).find('input:checked').map(function () {
          return $(this).val();
        }).get().join(';');

        if (str === '') {
          inputIsValid = false;
        }

        answers.push({
          id: itemId,
          answer: str
        });
        break;
      }

      if (!inputIsValid) {
        invalidInputCount++;
        $('.alert[data-id=' + itemId + ']').removeClass('alert-success');
        $('.alert[data-id=' + itemId + ']').addClass('alert-danger');
      } else {
        $('.alert[data-id=' + itemId + ']').removeClass('alert-danger');
        $('.alert[data-id=' + itemId + ']').addClass('alert-success');
      }
    });

    if (invalidInputCount === 0) {
      // 자료 저장
      $.ajax({
        type: 'POST',
        url: '/checklist/submit',
        data: {
          answers: answers,
          training_user_id: trainingUserId,
          course_id: courseId,
          course_list_id: courseListId
          // checklist_group_id: checklistGroupId
        }
      })
      .done(function (res) {
        if (!res.success) {
          console.error(res.msg);
        } else {
          window.alert('성실히 답변해주셔서 감사합니다');
          // 정답체크 완료 시 정답확인: 비활성화, 다음 버튼: 활성화
          $btnSumitAnswers.addClass('blind');
          $btnPlay.removeClass('blind');
          $btnPlay.click();
        }
      });
    } else {
      window.alert('작성하지 않은 항목이 존재합니다');
    }
  });
});
