connection.query(QUERY.something, [params], function (err, data) {
	if (err) {
		// 쿼리 실패
    res.json({
      success: false,
      msg: err
    });    
	} else {     
		// 쿼리 성공
    res.json({
      success: true
    });      
	}
});

