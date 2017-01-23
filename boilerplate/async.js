async.series([
	function (callback) {
		// some codes..
	},
	function (callback) {
		// some codes..
	}
], function (err, results) {
	if (err) {
		console.error(err);
	} else {
		console.info(results);

		//some codes..
	}
});

// with query
async.series([
	function (callback) {
		connection.query(QUERY.something, [params], function (err, data) {
			callback(err, data); // results[0]
		});
	},
	function (callback) {
		connection.query(QUERY.something, [params], function (err, data) {
			callback(err, data); // results[1]
		});
	}
], function (err, results) {
	if (err) {
		console.error(err);
	} else {
		console.info(results);
	}
});
    
// connection with transaction and async
// 참고 : https://github.com/mysqljs/mysql#transactions
connection.beginTransaction(function(err) {

  // 트렌젝션 오류 발생
  if (err) { 
    res.json({
      success: false,
      msg: err
    });
  }

  // async.series 쿼리 시작
  async.series([
    function (callback) {
      // 첫 번째 쿼리
      connection.query(QUERY.something1, [params], function (err, data) {
        callback(err, data); // results[0]
      });
    },
    function (callback) {
      // 두 번째 쿼리
      connection.query(QUERY.something2, [params], function (err, data) {
        callback(err, data); // results[1]
      });
    }
  ], function (err, results) {
    if (err) {

      // 쿼리 오류 발생
      return connection.rollback(function() {
        res.json({
          success: false,
          msg: err
        });
      });
    } else {
      connection.commit(function(err) {
        // 커밋 오류 발생
        if (err) {
          return connection.rollback(function() {
            res.json({
              success: false,
              msg: err
            });
          });
        }

        // 커밋 성공
        res.json({
          success: true
        });
      });
    }
  });  
});