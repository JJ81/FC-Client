module.exports = (function (){
	return {
		'local': {
			host: '127.0.0.1',
			port: '3306',
			user: 'root',
			password: '',
			database: ''
		},
		'dev' : {
			host: 'orangemanu.cchtmymwefrc.ap-northeast-2.rds.amazonaws.com',
			port: '3306',
			user: 'orangemanu',
			password: 'dhfpswlskantltmxpaeoqkr',
			database: 'orangemanu'
		},
		'real' : {
			host: '127.0.0.1',
			port: '3306',
			user: 'root',
			password: '',
			database: 'HC_AMS'
		}
	}
})();