/* express 설정 */
var express = require('express');
var router = express.Router();
/* DB 커넥션 객체 */
var mysql_dbc = require('../commons/db_conn')();
// DB 연결
var connection = mysql_dbc.init();
// DB 연결 테스트
//mysql_dbc.test_open(connection);
// 쿼리 로드
var QUERY = require('../database/query');

// url: /api/v1/video/record
router.post('/video/record', function (req, res) {
  
  var received_data = {

  };

  console.log(received_data);
  
});

module.exports = router;