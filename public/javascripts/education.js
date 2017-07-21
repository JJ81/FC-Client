requirejs([
  'jquery',
  'axios',
  'bootstrap'
],
function (jQuery, axios) {
  'use strict';

  var $ = $ || window.$;

  var inputCourse = $('#inputCourse');
  var selectAssignMonth = $('#selectAssignMonth');
  var optSearchType = $('input[type=radio][name=optradio]');
  var btnSearchCourse = $('#btnSearchCourse');
  var $notActivelistItem = $('a.not-active');

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
      if (searchText === '') {
        alert('강의명을 입력하세요');
        inputCourse.focus();
        return false;
      }
      break;

    case 'radio-assign-month':
      searchBy = 'month';
      searchText = selectAssignMonth.val();
      if (searchText === '') {
        alert('기간을 선택하세요');
        selectAssignMonth.focus();
        return false;
      }
      break;
    default:
      break;
    }

    window.location.href =
      btnSearchCourse.data('redirect') +
        '?searchby=' + searchBy + '&searchtext=' + searchText;
  });

  inputCourse.on('keypress', function (e) {
    if (e.which == 13) {
      btnSearchCourse.click();
    }
  });
});
