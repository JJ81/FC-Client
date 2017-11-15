window.requirejs([
  'common',
  'bootstrap'
],
function (Util) {
  'use strict';

  var $ = $ || window.$;

  var inputCourse = $('#inputCourse');
  var selectAssignMonth = $('#selectAssignMonth');
  var optSearchType = $('input[type=radio][name=optradio]');
  var btnSearchCourse = $('#btnSearchCourse');
  var $notActivelistItem = $('.list_item a.not-active');
  var $listItem = $('.list_item');
  var yearmonth;
  var $inputSearchBy = $('#searchby');
  var $inputSearchText = $('#searchtext');

  $(function () {
    $('.item_wrap').each(function (index) {
      if (yearmonth === undefined || yearmonth !== $(this).data('yearmonth')) {
        yearmonth = $(this).data('yearmonth');

        $('<li class="yearmonth"><i class="fa fa-calendar" aria-hidden="true"></i> ' + yearmonth + '</li>').insertBefore($(this));
      }
    });

    if ($inputSearchBy.val()) {
      switch ($inputSearchBy.val()) {
      case 'course':
        inputCourse.focus();
        inputCourse.val($inputSearchText.val());
        $('#radio-course-title').prop('checked', true);
        break;
      case 'month':
        selectAssignMonth.focus();
        selectAssignMonth.val($inputSearchText.val());
        $('#radio-assign-month').prop('checked', true);
        break;

      default:
        break;
      }
    }
  });

  inputCourse.on('focus', function () {
    $('#radio-course-title').prop('checked', true);
  });

  selectAssignMonth.on('focus', function () {
    $('#radio-assign-month').prop('checked', true);
  });

  $notActivelistItem.on('click', function (e) {
    e.preventDefault();
    window.alert('재수강이 불가한 강의입니다.');
  });

  optSearchType.change(function () {
    var id = $(this).attr('id');
    switch (id) {
    case 'radio-course-title':
      inputCourse.focus();
      break;
    case 'radio-assign-month':
      selectAssignMonth.focus();
      break;
    default:
      break;
    }
  });

  btnSearchCourse.click(function () {
    var btnRadio = $('input[type=radio][name=optradio]:checked');
    var id = btnRadio.attr('id');
    var searchBy;
    var searchText;

    switch (id) {
    case 'radio-course-title':
      searchBy = 'course';
      searchText = inputCourse.val();
      break;

    case 'radio-assign-month':
      searchBy = 'month';
      searchText = selectAssignMonth.val();
      break;
    default:
      break;
    }

    window.location.href =
      btnSearchCourse.data('redirect') +
        '?searchby=' + searchBy + '&searchtext=' + searchText;
  });

  $('.pagination a').on('click', function (e) {
    e.preventDefault();

    var btnRadio = $('input[type=radio][name=optradio]:checked');
    var id = btnRadio.attr('id');
    var searchBy;
    var searchText;
    var pageNum = $(this).data('page');

    switch (id) {
    case 'radio-course-title':
      searchBy = 'course';
      searchText = inputCourse.val();
      break;

    case 'radio-assign-month':
      searchBy = 'month';
      searchText = selectAssignMonth.val();
      break;
    default:
      break;
    }

    window.location.href =
      btnSearchCourse.data('redirect') +
        '?searchby=' + searchBy + '&searchtext=' + searchText + '&page=' + pageNum;
  });

  inputCourse.on('keypress', function (e) {
    if (e.which == 13) {
      btnSearchCourse.click();
    }
  });

  selectAssignMonth.on('change', function () {
    btnSearchCourse.click();
  });

  $listItem.on('click', function (e) {
    e.preventDefault();

    if ($(this).hasClass('not-active')) {
      return false;
    }

    var url = $(this).attr('href');

    window.axios.get('/course/check', {
      params: {
        training_user_id: $(this).data('training-user-id'),
        course_id: $(this).data('course-id')
      }
    })
    .then(function (res) {
      var data = res.data;

      if (data.success) {
        if (data.can_progress !== 1) {
          if (data.prev_course_name !== '') {
            window.alert('교육과정 : ' + data.eduName + '\n' + '강의명 : ' + data.prev_course_name + '\n' + '\n을 먼저 이수하세요.');
          }
        } else {
          if (url) {
            window.location.href = url;
          }
        }
      }
    })
    .catch(function (error) {
      console.error(error);
    });
  });
});
