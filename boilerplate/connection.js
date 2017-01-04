connection.query(QUERY.something, [params], function (err, data) {
	if (err) {
		// 쿼리 실패시
		return new Error('');
	} else {     
		// 쿼리 성공시       
	}
});

