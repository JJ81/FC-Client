'use strict';
requirejs(
  [
    'jquery'
    , 'bootstrap'
    , 'jquery_datatable'
    , 'bootstrap_datatable'
    , 'fastclick'
    , 'jqueryValidate'
  ],


  function (jQuery) {
    var $ = jQuery;

    $('#table_agent').DataTable({
      "paging": false,
      "lengthChange": true,
      "searching": false,
      "ordering": true,
      "info": true,
      "autoWidth": true
    });

    var frm_create_agent = $('#frm_create_agent');
    var btn_create_agent_submit = $('.btn-create-agent-submit');
    var frm_set_agent_password = $('#frm_set_agent_password');
    var create_agent_code = $('.create-agent-code');
    var pass = $('.pass');
    var re_pass = $('.re_pass');
    var btn_dropdown_action = $('.btn-dropdown-action');
    var credit_to = $('.credit-to');
    var debit_to = $('.debit-to');
    var my_balance = $('.my_balance');


    var
      code = null,
      balance = null,
      parent_id = null,
      layer = null,
      suspend = null,
      newBalance = null,
      currentBalance = null,
      amount = null,
      agent_duplicated = null;

    /*dropdown action click시 데이터 바인딩*/
    btn_dropdown_action.on('click', function () {
      code = ($(this).attr('data-code'));
      balance = Number($(this).attr('data-balance'));
      parent_id = ($(this).attr('data-parent_id'));
      layer = ($(this).attr('data-layer'));
      suspend = ($(this).attr('data-suspend'));
    });


    /* credit modal show*/
    credit_to.bind('click', function () {
      var _this = $('#modal_credit_to');
      _this.modal('show');
      _this.find('#credit_target').val(code);
      _this.find('#credit_balance').val(balance);
    });

    /*debit modal show*/
    debit_to.bind('click', function () {
      var _this = $('#modal_debit_to');
      _this.modal('show');
      _this.find('#debit_target').val(code);
      _this.find('#debit_balance').val(balance);
    });

    /*password re set modal show*/
    $('.set-agent-password').on('click', function () {
      var _this = $('#setAgentPassword');
      _this.modal('show');
      _this.find('#code').val(code);
    });

    $('#select-agent-code').on('change', function () {
      var layer = $(this).find('option:selected').attr('data-layer');
      $('#agent-layer').val(layer);
    });

    frm_create_agent.validate({
      //validation이 끝난 이후의 submit 직전 추가 작업할 부분
      submitHandler: function () {
        var f = confirm("작업을 완료하겠습니까?");
        if (f) {
          return true;
        } else {
          return false;
        }
      },
      //규칙
      rules: {
        create_agent_code: {
          required: true,
          minlength: 4,
          remote: {
            async: false,
            url: '/api/v1/agent/duplicated',
            type: 'post',
            dataFilter: function (data) {
              var json = JSON.parse(data);
              console.log(json);
              if (json.success && json.duplicated) {
                return "\"" + '이미 사용중인 Agent code 입니다.' + "\"";
              } else {
                return true;
              }
            }
          }

        },
        pass: {
          required: true,
          minlength: 4
        },
        re_pass: {
          required: true,
          minlength: 4,
          equalTo: pass
        }
      },
      //규칙체크 실패시 출력될 메시지
      messages: {
        create_agent_code: {
          required: "필수로입력하세요",
          minlength: "최소 {0}글자이상이어야 합니다"
        },
        pass: {
          required: "필수로입력하세요",
          minlength: "최소 {0}글자이상이어야 합니다"
        },
        re_pass: {
          required: "필수로입력하세요",
          minlength: "최소 {0}글자이상이어야 합니다",
          equalTo: "비밀번호가 일치하지 않습니다."
        }
      }
    });

    frm_set_agent_password.validate({
      //validation이 끝난 이후의 submit 직전 추가 작업할 부분
      submitHandler: function () {
        var f = confirm("작업을 완료하겠습니까?");
        if (f) {
          return true;
        } else {
          return false;
        }
      },
      //규칙
      rules: {
        pass: {
          required: true,
          minlength: 4
        },
        re_pass: {
          required: true,
          minlength: 4,
          equalTo: '#set_password'
        }
      },
      //규칙체크 실패시 출력될 메시지
      messages: {
        pass: {
          required: "필수로입력하세요",
          minlength: "최소 {0}글자이상이어야 합니다"
        },
        re_pass: {
          required: "필수로입력하세요",
          minlength: "최소 {0}글자이상이어야 합니다",
          equalTo: "비밀번호가 일치하지 않습니다."
        }
      }
    });


    /*credit To Agent*/
    var
      credit_amount = $('#credit_amount'),
      credit_balance = $('#credit_balance'),
      credit_sum_balance = $('#credit_sum_balance'),
      btn_credit_to_submit = $('.btn-credit-to-submit'),
      frm_credit_to = $('#frm_credit_to');

    credit_amount.bind('change', function () {
      currentBalance = Number(credit_balance.val());
      amount = Number(credit_amount.val());

      newBalance = sumCredit(currentBalance, amount);
      my_balance.val(sumDebit(Number($('#my_current_balance').val()), amount));
      credit_sum_balance.val(newBalance);
    });

    function sumCredit(balance, amount) {
      return (balance + amount);
    }

    frm_credit_to.validate({
      submitHandler: function () {
        var submit_check = confirm('입력하신 Amount : ' + amount + '$ 총합산 Balance : ' + newBalance + '$가 맞습니까?');
        if (submit_check) {
          return true
        } else {
          return false
        }
      },
      rules: {
        target: {
          required: true
        },
        balance: {
          required: true
        },
        sum_balance: {
          required: true,
          min: 1
        },
        amount: {
          required: true,
          range: [1, $('#my_current_balance').val()]
        },
        memo: {
          required: true
        }
      }
    });


    /*credit To Agent END*/

    /*Debit To Agent*/
    var
      debit_amount = $('#debit_amount'),
      debit_balance = $('#debit_balance'),
      debit_sum_balance = $('#debit_sum_balance'),
      frm_debit_to = $('#frm_debit_to');


    debit_amount.bind('change', function () {
      currentBalance = Number(debit_balance.val());
      amount = Number(debit_amount.val());

      newBalance = sumDebit(currentBalance, amount);
      my_balance.val(sumCredit(Number($('#my_current_balance').val()), amount));
      debit_sum_balance.val(newBalance);
    });


    function sumDebit(balance, amount) {
      return Number(balance - amount);
    }

    frm_debit_to.validate({
      submitHandler: function () {
        var submit_check = confirm('입력하신 Amount : ' + amount + '$ 총합산 Balance : ' + newBalance + '$가 맞습니까?');
        if (submit_check) {
          return true;
        } else {
          return false;
        }
      },
      rules: {
        target: {
          required: true
        },
        sum_balance: {
          required: true,
          min: 0
        },
        balance: {
          required: true
        },
        amount: {
          required: true,
          min: 1
          // range: [1, 1670]
        },
        memo: {
          required: true
        }
      }
    });

    /*Debit To Agent END*/

    /*set suspend agent*/
    var set_suspend = $('.set-suspend');

    set_suspend.on('click', function () {
      var checkSuspend = confirm(code + 'Agent를 정지 시키겠습니까?');
      if (checkSuspend) {
        var _code = code;
        $.post('/api/v1/agent/to/suspend', {code: _code, suspend: 1}).done(function (data) {
          console.log(data)
        })
      }
    });

    /*set wake up agent*/
    var wake_up = $('.set-wake-up');

    wake_up.on('click', function () {
      var checkSuspend = confirm(code + 'Agent를 활성화 시키겠습니까?');
      if (checkSuspend) {
        var _code = code;
        $.post('/api/v1/agent/to/suspend', {code: _code, suspend: 0}).done(function (data) {
          console.log(data)
        })
      }
    });
  }
);

