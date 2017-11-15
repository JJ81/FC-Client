/**
 * Created by parkseokje
 * 퀴즈, 파이널 테스트
 * TODO
 */

'use strict';

requirejs([
  'common'
],
  function (Util) {
    var $ = $ || window.$;
    var btn_play = $('#btn_play_next');
    var btn_check_answer = $('#btn_check_answers');
    var quiz_inputs = $('.answer_quiz_input');
    var quiz_options = $('.ico:not(.ico_play)');
    var next_url = btn_play.attr('href');
    var training_user_id = btn_play.data('training-user-id');
    var course_id = btn_play.data('course-id');
    var course_list_id = btn_play.data('course-list-id');
    var course_list_type = btn_play.data('course-list-type');
    var canValidate = false;

      // jquery load event
    $(function () {
      canValidate = (!btn_check_answer.hasClass('blind')); // 정답확인 가능여부
      sessionProgressStartLogger();
    });

    quiz_inputs.on('change keyup', function (e) {
      // 정답 체크 시마다 모든 문제의 정답 입력/선택 여부를 검사한다.
      validateOptionInputs();
    });

    // 정답 체크/미체크, 정답확인 노출여부 판단
    quiz_options.click(function (e) {
      e.preventDefault();

      var element = $(this);

      if (element.hasClass('ico_checked')) {
        element.removeClass('ico_checked');
        element.addClass('ico_unchecked');
        element.closest('a').attr('data-value', 0);
      } else {
        element.removeClass('ico_unchecked');
        element.addClass('ico_checked');
        element.closest('a').attr('data-value', 1);
      }

        // 정답 체크 시마다 모든 문제의 정답 입력/선택 여부를 검사한다.
      validateOptionInputs();
    });

      // 세션 시작일시 로깅
    function sessionProgressStartLogger () {
      $.ajax({
        type: 'POST',
        url: '/session/log/starttime',
        data: {
          training_user_id: training_user_id,
          course_id: course_id,
          course_list_id: course_list_id,
          course_list_type: course_list_type
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
          training_user_id: training_user_id,
          course_id: course_id,
          course_list_id: course_list_id,
          course_list_type: course_list_type
        }
      }).done(function (res) {
        if (!res.success) {
          console.error(res.msg);
        } else {
            // console.info('세션 종료시간 기록');
          location.href = next_url;
        }
      });
    }

    // 정답 입력/선택여부를 체크한다.
    function validateOptionInputs () {
      var isOk = true;

      if (canValidate) return isOk;

      $('.option').each(function (index) {
        if ($(this).hasClass('answer_quiz_input')) {
          if ($(this).val() === '') {
            isOk = false;
            return false;
          }
        } else {
          if ($(this).children().children('a').children('.ico_checked').length === 0) {
            isOk = false;
            return false;
          }
        }
      });

      if (isOk) { btn_check_answer.removeClass('blind'); } else { btn_check_answer.addClass('blind'); }
    }

    btn_check_answer.on('click', function (e) {
      e.preventDefault();
      checkQuizAnswer();
    });

    /**
     * 정답을 체크한다.
     * (deprecated)
     */
    function checkQuizAnswer_deprecated () {
      var answers = []; // 전송할 데이터

      $('.option').each(function (index) {
        if ($(this).hasClass('answer_quiz_input')) {
          // 단답형
          answers.push({
            quiz_id: $(this).data('quiz-id'),
            answer: $(this).val(),
            answer_column: 'answer_desc'
          });
        } else {
          // 선택형, 다지선다형

          var answer_ids = [],
            answer_names = [];

          $(this).children('li').children('a').map(function () {
            if ($(this).children().hasClass('ico ico_checked')) {
              answer_ids.push($(this).parent().data('option-id'));
              answer_names.push($(this).children('.answer').html());
            }
          });

          if (answer_ids.length === 0) { answer_ids = ''; }

          answers.push({
            quiz_id: $(this).data('quiz-id'),
            answer_ids: answer_ids,
            answer_names: answer_names.join(','),
            answer_column: 'answer'
          });
        }
      });

      $.ajax({
        type: 'POST',
        url: '/quiz/log/checkanswer',
        data: {
          data: answers,
          training_user_id: training_user_id,
          course_list_id: course_list_id
        }
      }).done(function (res) {
        if (!res.success) {
          console.error(res.msg);
        } else {
          console.info('퀴즈 정답체크 시작');

          var results = res.results;

          for (var i = 0; i < results.length; i++) {
            // 오답일 경우 정답표시
            if (!results[i].iscorrect) {
              // 정답표시
              $('#alert_' + results[i].quiz_id).removeClass('blind').html('! 정답은 ' + results[i].correct_answer + ' 입니다.');

              // 단답형일 경우
              if (results[i].answer_column === 'answer_desc') {
                $('[name=input_' + results[i].quiz_id + ']').addClass('input_wrong');
              }
            } else {
              $('#alert_' + results[i].quiz_id).removeClass('blind').addClass('correct').html('정답입니다.');
            }
          }

          // 다음 버튼 활성화
          btn_check_answer.addClass('blind');
          btn_play.removeClass('blind');

          console.info('퀴즈 정답체크 종료');
        }
      });
    }

    /**
     * 정답을 체크한다.
     */
    function checkQuizAnswer () {
      var quizzes = $('.quiz_select');
      var answers = [];

      for (var index = 0; index < quizzes.length; index++) {
        var quiz = $(quizzes[index]);
        var quiz_type = quiz.data('quiz-type');     // 퀴즈 타입(A/B/C)
        var quiz_id = quiz.data('quiz-id');         // 퀴즈 id
        var quiz_answer = quiz.data('quiz-answer');  // 퀴즈 정답
        var answer = {
          quiz_id: quiz_id,
          quiz_type: quiz_type,
          iscorrect: false,
          answer: null
        };

        // 단답형
        if (quiz_type === 'A') {
          quiz.attr('data-answered', quiz.children('.not-select').children('.answer_quiz_input').val().trim());
          quiz.attr('data-iscorrect', (quiz.attr('data-answered') == quiz_answer ? 1 : 0));
        }
        // 선택형/다답형
        else {
          var arr = quiz.children('ol.selection').children('li');
          var answered = [];

          quiz.attr('data-iscorrect', 1);

          for (var i = 0; i < arr.length; i++) {
            if ($(arr[i]).children('a').children('.ico_checked').length > 0) { answered.push($(arr[i]).children('a').children('.answer').text()); }

            var left = $(arr[i]).attr('data-iscorrect'),
              right = ($(arr[i]).children('a').children('.ico_checked').length > 0);

            if (left != right) { quiz.attr('data-iscorrect', 0); }

            // if ($(arr[i]).attr("data-iscorrect") != 1)
            //   if ($(arr[i]).children("a").children(".ico_checked").length !== 0)
            //     quiz.attr("data-iscorrect", 0);

            quiz.attr('data-answered', answered.join(','));
          }
        }

        quiz.children('.result_quiz').removeClass('correct');
        if (quiz.attr('data-iscorrect') != 1) {
          quiz.children('.result_quiz').removeClass('blind')
            .html('! 정답은 ' + quiz_answer + ' 입니다.');
        } else {
          quiz.children('.result_quiz').removeClass('blind')
            .addClass('correct')
            .html('정답입니다.');
        }

        // 사용자 입력답안을 push 한다.
        answer.iscorrect = quiz.attr('data-iscorrect');
        answer.answer = quiz.attr('data-answered');
        answers.push(answer);
      }

      // 사용자 입력 답안, 정답여부 등을 기록
      // console.log(answers);
      $.ajax({
        type: 'POST',
        url: '/quiz/log/checkanswer',
        data: {
          data: answers,
          training_user_id: training_user_id,
          course_id: course_id,
          course_list_id: course_list_id,
          course_list_type: course_list_type
        }
      })
      .done(function (res) {
        if (!res.success) {
          console.error(res.msg);
        } else {
          // 정답체크 완료 시 정답확인: 비활성화, 다음 버튼: 활성화
          btn_check_answer.addClass('blind');
          btn_play.removeClass('blind');
        }
      });
    }

    // 다음으로
    btn_play.on('click', function (event) {
      event.preventDefault();

      // 세션 종료로그를 기록한다.
      sessionProgressEndLogger();
    });
  }
);
