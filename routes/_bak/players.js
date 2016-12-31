var express = require('express');
var router = express.Router();
//var mysql = require('mysql');
var mysql_dbc = require('../../commons/db_conn')();
var connection = mysql_dbc.init();


var PROJ_TITLE = "Hold'em Club AMS, ";
var bcrypt = require('bcrypt');
var async = require('async');
var QUERY = require('../../database/query');
require('../../commons/helpers');
/**
 * 모든 플레이어를 보여준다.
 * 회원가입일자 내림차순으로 정렬하여 조회한다.
 */


var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
};


router.get('/', isAuthenticated, function (req, res) {
  /*
   todo 가장 하위 에이전트일 경우 내려줄 데이터는 없다 (if tier-3)
   todo tier-3일 경우 자기 플레이어만 보여주면 된다
   todo tier-1, tier-2일 경우 저신과 자신의 하위 에이전트만 내려주면 된다. (top_parent_id가 일치하는 리스트를 기반으로 플레이어를 조회한다)
   todo tier-0(root)의 경우 layer 내림차순으로 전체 플레이어를 가져오면 된다.
   todo 세션에서 에이전트 코드를 통해서 리스트를 가져온 후에 해당 에이전트에 속한 플레이어 리스트를 가져온다.


   todo 일단 에이전트 정보를 셀렉트 박스에 바인딩 해보자.

   * */

  var _query = {
    player: null,
    agent: null
  };
  var _layer = req.user.layer;
  var _agent = req.user.agent;
  var _top_parent_id = req.user.top_parent_id;
  var _to_player_param_list = []; // 에이전트가 복수개일 경우
  var _to_player_param_list_length = null;
  var _to_agent_parma_list = [];

  if (_layer == '3') {
    _query.player = QUERY.PLAYER.READ_PAYER_LAYER_1;
    _query.agent = QUERY.AGENT.READ_AGENT_LIST_LAYER_3;
    _to_agent_parma_list = [_agent];
  }
  else if (_layer == '2') {
    // todo 자신과 자신의 하위 에이전트를 parent_id로 검색하여 찾는다.
    // todo) 매 케이스마다 쿼리에 넘길 에이전트 코드 파라미터 개수가 유동적이므로 미리 작성한 쿼리문을 통해서는 문제가 생길 것이다.
    // todo) 따라서 이곳에서 쿼리에 데이터를 직접 바인딩하여 세팅하여 조회할 수 있도록 해야겠다.
    _query.player = QUERY.PLAYER.READ_PAYER_LAYER_1;
    _query.agent = QUERY.AGENT.READ_AGENT_LIST_LAYER_2;
    _to_agent_parma_list = [_agent, _agent];
  }
  else if (_layer == '1') {
   // todo 자신의 이름으로 된 top_parent_id 칼럼에서 모두 조회하여 가져올 수 있다.
    _query.player = QUERY.PLAYER.READ_PAYER_LAYER_1;
    _query.agent = QUERY.AGENT.READ_AGENT_LIST_LAYER_1;
    _to_agent_parma_list = [_top_parent_id, _layer];
  }
  else if (_layer == '0') { // top
    _query.player = QUERY.PLAYER.READ_ALL_PLAYER;
    _query.agent = QUERY.AGENT.READ_AGENT_TOP_TIER;
  }

  async.series([
    function (callback) {
      connection.query(_query.agent, _to_agent_parma_list, function (err, result) {
        _to_player_param_list_length = result.length;

        for (var i = 0; i < _to_player_param_list_length; i++) {
          _to_player_param_list.push(result[i].code)
        }
        callback(err, result);
      })
    },
    function (callback) {
      connection.query(_query.player, [_to_player_param_list], function (err, result) {
        callback(err, result);
      })
    }
  ], function (err, results) {
    //console.log(results[1]);
    if (err) {
      console.log(err);
      err.coee = 500;
    } else {
      res.render('players', {
        current_path: 'Players',
        title: PROJ_TITLE + 'Players',
        loggedIn: req.user,
        data: results[1],
        agent_list: results[0]
      });
    }
  })
});

module.exports = router;