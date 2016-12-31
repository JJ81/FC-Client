var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var mysql_dbc = require('../../commons/db_conn')();
var connection = mysql_dbc.init();

var bcrypt = require('bcrypt');
var async = require('async');
var QUERY = require('../../database/query');
var cal = require('../../service/_bak/calculate');
var util = require('../../service/_bak/util');


/**
 * create agent
 */
router.post('/agent/create', function (req, res) {
  var _data = {
    code: req.body.create_agent_code,
    password: req.body.pass,
    parent_id: req.body.parent_agent, // 이 값을 통해서 선택한 agent의 id값이 parent_id가 된다.
    top_parent_id: (req.body.top_parent_id === "") ? req.body.code : req.body.top_parent_id,
    layer: Number(req.body.layer) + 1
  };
  _data.password = bcrypt.hashSync(_data.password, 10);

  connection.query(QUERY.AGENT.create, _data,
    function (err, data) {
      if (err) {
        console.log(err);
        res.json({
          success: false
        });
      } else {
        if (data) {
          res.json({
            success: true
          });
        }
      }
    });
});

/**
 * Check if the agent code is duplicated or not.
 */
router.post('/agent/duplicated', function (req, res) {
  console.log(req.body);
  var stmt = 'select * from `agent` where `code`=?;';
  console.log(stmt);
  connection.query(stmt, [req.body.create_agent_code], function (err, data) {
    if (err) {
      res.json({
        success: false
      });
    } else {
      console.log(data.length);
      if (data.length === 0) {
        //res.json("true");
        res.json({
          'success': true,
          'duplicated': false
        });
      } else {
        //res.json("false");
        res.json({
          'success': true,
          'duplicated': true
        });
      }
    }
  });
});

router.post('/agent/set/password', function (req, res) {
  var password = req.body.pass;
  var re_password = req.body.re_pass;
  var code = req.body.code;

  console.log(code);

  if (password != re_password) {
    /*TODO 일치하지 않을 경우 처리*/
  }
  var hash = bcrypt.hashSync(password, 10);

  //var stmt_agent_password_reset = 'update `agent` set `password` = ? where `code` = ?;';

  connection.query(QUERY.AGENT.changePassword, [hash, code], function (err, result) {
    if (err) {
      res.json({
        success: false
      })
    } else {
      res.json({
        success: true
      })
    }
  });
});


router.post('/agent/credit/to', function (req, res, next) {
  var bodyEmptyCheck = util.objEmptyCheck(req.body);

  if (!bodyEmptyCheck) {
    console.log('body is empty');
    return false
  }

  var _creditInfo = {
    target: req.body.target,
    amount: Number(req.body.amount)
  };


  /*나 자신에게 Credit시 오류, sun_balance가 0보다 작으면오류*/
  if (_creditInfo.target == req.user.agent || req.body.sum_balance <=0) {
    console.log('self credit err');
    return false;
  }


  var _creditLogInfo = {
    agent_id: req.user.agent,
    date: new Date(),
    type: 'A2A',
    amount: _creditInfo.amount,
    balance: null,
    target_agent_id: _creditInfo.target,
    target_player_id: null,
    memo: req.body.memo
  };

  connection.beginTransaction(function (err) {
    async.series([
        function (callback) {
          connection.query(QUERY.AGENT.UPDATE_AMOUNT_DEBIT, [_creditInfo.amount, _creditLogInfo.agent_id], function (err, result) {
            callback(err, result);
          })
        },
        function (callback) {
          connection.query(QUERY.AGENT.UPDATE_AMOUNT_CREDIT, [_creditInfo.amount, _creditInfo.target], function (err, result) {
            callback(err, result);
          })
        },
        function (callback) {
          connection.query(QUERY.AGENT.READ_BALANCE, [_creditLogInfo.agent_id], function (err, result) {
            _creditLogInfo.balance = result[0].balance;
            callback(err, result);
          })
        },
        function (callback) {
          connection.query(QUERY.HOME.LOG_WALLET, _creditLogInfo, function (err, result) {
            callback(err, result)
          })
        }
      ], function (err, results) {
        if (err) {
          connection.rollback();
          console.log(err);
          err.coee = 500;
        } else {
          connection.commit();
          req.user.balance = _creditLogInfo.balance;
          res.json({
            success: true
          })
        }
      }
    )
  });
});


router.post('/agent/debit/to', function (req, res, next) {
  var bodyEmptyCheck = util.objEmptyCheck(req.body);

  if (!bodyEmptyCheck) {
    console.log('body is empty');
    return false;
  }

  var _debitInfo = {
    target: req.body.target,
    amount: Number(req.body.amount)
  };

  /*나 자신에게 Credit시 오류, sun_balance가 0보다 작으면오류*/
  if (_debitInfo.target == req.user.agent || req.body.sum_balance <0) {
    console.log('self credit err');
    return false;
  }

  var _debitLogInfo = {
    agent_id: req.user.agent,
    date: new Date(),
    type: 'A2A',
    amount: Number(req.body.amount),
    balance: null,
    target_agent_id: _debitInfo.target,
    target_player_id: null,
    memo: req.body.memo
  };

  connection.beginTransaction(function (err) {
    async.series([
        function (callback) {
          connection.query(QUERY.AGENT.UPDATE_AMOUNT_CREDIT, [_debitInfo.amount, _debitLogInfo.agent_id], function (err, result) {
            callback(err, result);
          })
        },
        function (callback) {
          connection.query(QUERY.AGENT.UPDATE_AMOUNT_DEBIT, [_debitInfo.amount, _debitInfo.target], function (err, result) {
            callback(err, result);
          })
        },
        function (callback) {
          connection.query(QUERY.AGENT.READ_BALANCE, [_debitLogInfo.agent_id], function (err, result) {
            _debitLogInfo.balance = result[0].balance;
            callback(err, result);
          })
        },
        function (callback) {
          connection.query(QUERY.HOME.LOG_WALLET, _debitLogInfo, function (err, result) {
            callback(err, result)
          })
        }
      ], function (err, results) {
        if (err) {
          connection.rollback();
          console.log(err);
          err.coee = 500;
        } else {
          connection.commit();
          req.user.balance = _debitLogInfo.balance ;
          res.json({
            success: true
          })
        }
      }
    )
  });
});

/*Agent suspend or wake up*/
router.post('/agent/to/suspend', function (req, res, next) {

  console.log(req.body);
  var bodyEmptyCheck = util.objEmptyCheck(req.body);
  if (!bodyEmptyCheck) {
    console.log('body is empty');
    return false;
  }

  connection.query(QUERY.AGENT.SUSPEND, [req.body.suspend, req.body.code], function (err, result) {
    if (err) {
      res.json({
        success: false
      })
    } else {
      console.log('suspend end');
      res.json({
        success: true
      })
    }
  });
});


/*Player Credit */
router.post('/player/credit/to', function (req, res, next) {

  console.log('player to...');
  var bodyEmptyCheck = util.objEmptyCheck(req.body);

  if (bodyEmptyCheck === false) {
    console.log('body is empty');
    return false
  }

  var _creditInfo = {
    target: req.body.target,
    balance: (cal.creditResult(req.body.balance, req.body.amount)),
    amount: Number(req.body.amount)
  };

  if (_creditInfo.balance === false || _creditInfo.amount === 0) {
    console.log('0 or zero');
    return false;
  }

  var _creditLogInfo = {
    agent_id: req.user.agent,
    date: new Date(),
    type: 'A2P',
    amount: _creditInfo.amount,
    balance: _creditInfo.balance,
    target_agent_id: null,
    target_player_id: _creditInfo.target,
    memo: req.body.memo
  };

  connection.beginTransaction(function (err) {
    async.series([
        function (callback) {
          connection.query(QUERY.PLAYER.UPDATE_CREDIT, [_creditInfo.balance, _creditInfo.target], function (err, result) {
            callback(err, result);
          })
        },
        function (callback) {
          connection.query(QUERY.HOME.LOG_WALLET, _creditLogInfo, function (err, result) {
            callback(err, result)
          })
        }
      ], function (err, results) {
        if (err) {
          connection.rollback();
          console.log(err);
          err.coee = 500;
        } else {
          connection.commit();
          res.json({
            success: true
          })
        }
      }
    )
  })

});

/*Player Credit */

/*Player create  */



/* GET Current Balance */
router.get('/agent/get/current/balance', function (req, res, next) {
  var agent_code = req.query.code;

  connection.query(QUERY.AGENT.READ_BALANCE, [agent_code],function (err, result) {
    if(err){
      console.log(err);
      res.json({
        success: false
      })
    }else{
      console.log(result[0].balance);
      req.user.balance = result[0].balance;
      console.log(req.user.balance);
      res.json({
        success: true,
        current_balance: result[0].balance
      });

    }

  })
});








/***
 * 중복검사 holdemclub API 사용할것
 * user_id, nickname, email
 * */
router.post('/player/create', function (req, res, next) {


});

module.exports = router;