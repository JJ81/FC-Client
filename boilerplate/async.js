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
    