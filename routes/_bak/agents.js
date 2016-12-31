var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var mysql_dbc = require('../../commons/db_conn')();
var connection = mysql_dbc.init();
var async = require('async');
var QUERY = require('../../database/query');


/**
 * agent page
 * */


/*TODO 중복 코드*/
var PROJ_TITLE = "Hold'em Club AMS, ";
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
};

router.get('/', isAuthenticated, function (req, res) {

  if(req.user.layer ===3){
    res.redirect('/home');
  }

  var agent_code = req.user.agent;
  var layer = req.user.layer;
  var top_parent_id = req.user.top_parent_id;
  var parent_id = req.user.parent_id;
  //var stmt = "select * from `agent` where `code`='" + agent_code + "';";
  //console.log(stmt);
  var stmt_agent_list = null;
  var agent_list = []; // 에이전트 선택 리스트


  //console.log(agent_code);
  // todo 1. top tier의 경우, 자신을 기준으로 layer별로 내림차순으로 준다.

  // todo 2. tier-1,2일 경우, 자신과 자신의 하위 에이전트를 layer 내림차순으로 정렬하여 내려준다.

  // todo 3. tier-3일 경우, 자신만 볼 수 있다. 사실 자신만 볼 수 있는 거라면 agents 메뉴가 노출될 필요가 없다.

  if (layer === 0) {
    stmt_agent_list = QUERY.AGENT.READ_AGENT_TOP_TIER
  } else if (layer === 1) {
    stmt_agent_list = QUERY.AGENT.READ_AGENT_LIST_LAYER_1;
    agent_list = [top_parent_id, layer];
  } else if (layer === 2) {
    stmt_agent_list = QUERY.AGENT.READ_AGENT_LIST_LAYER_2;
    agent_list = [agent_code, agent_code]
  } else if (layer === 3) {
    stmt_agent_list = QUERY.AGENT.READ_AGENT_LIST_LAYER_3;
    agent_list = [agent_code]
  }

  async.series([
    function (callback) {
      connection.query(stmt_agent_list, agent_list, function (err, result) {
        callback(err, result);
      })
    }
  ], function (err, results) {
    if (err) {
      console.log(err)
    } else {
      res.render('agents', {
        current_path: 'Agents',
        title: PROJ_TITLE + 'Agents',
        loggedIn: req.user,
        agent_list: results[0],
        top_parents: top_parent_id
      });
    }
  });


  //connection.query(stmt, function (err, data) {
  //  if (err) {
  //    return new Error('');
  //  } else {
  //    if (data[0].layer == null || data[0].layer == 0) {
  //      console.info('top tier');
  //      //stmt_agent_list = "select `code` from `agent` where `layer` is not null and `layer` < 3 order by `layer` asc;";
  //      stmt_agent_list = "select *from `agent` where `layer` is not null and `layer` <= 3 order by `layer` asc;";
  //    } else if (data[0].layer == '1') {
  //      // 자신이 1일 경우, 자신과 자신 아래에 있는 에이전트를 layer 3을 제외하고 가져온다.
  //      console.info('first grade');
  //      stmt_agent_list = "select * from `agent` where `top_parent_id`='" + data[0].top_parent_id + "' and `layer` < 3 order by `layer` asc;";
  //    } else if (data[0].layer == '2') {
  //      // 나 자신과 자식 에이전트를 가져온다
  //      console.info("i\'m alone");
  //      //stmt_agent_list = "select `code` from `agent` where `code`='" + agent_code + "';";
  //      stmt_agent_list = "select `code` from `agent` where `code`='" + agent_code + "' or `parent_id`='" + agent_code + "';";
  //    } else {
  //      console.info('bottom tier');
  //      stmt_agent_list = "select `code` from `agent` where `code`=null";
  //    }
  //    console.log(stmt_agent_list);
  //
  //    connection.query(stmt_agent_list, function (err, list) {
  //      if (err) {
  //        console.error(err);
  //        return new Error('');
  //      } else {
  //        // console.info(list);
  //        agent_list = list;
  //
  //        if (data[0].layer == null || data[0].layer == '1') {
  //          agent_list.splice(0, 0, {code: agent_code});
  //        }
  //
  //        res.render('agents', {
  //          current_path: 'Agents',
  //          title: PROJ_TITLE + 'Agents',
  //          loggedIn: req.user,
  //          agent_list: agent_list,
  //          top_parents: data[0].top_parent_id
  //        });
  //      }
  //    });
  //  }
  //});


});


module.exports = router;