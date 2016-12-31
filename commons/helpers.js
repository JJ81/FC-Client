var hbs = require('hbs');
// var moment = require('moment');
var currencyFormatter = require('currency-formatter');
var dateFormat = require('dateFormat');

hbs.registerHelper('isEquals', function (a, b) {
	return (a === b);
});

hbs.registerHelper('isEmpty', function (a) {
	return (a === '' || a === null);
});

//hbs.registerHelper('time', function (time) {
//	return moment().utc(time).format("YYYY-MM-DD HH:mm:ss");
//});

hbs.registerHelper('comma-number', function (num) {
	(num === null) ? num = 0 : null;
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
});

hbs.registerHelper('currency', function (num) {
	return currencyFormatter.format(num, { code: 'USD' });
});

hbs.registerHelper('checkMinus', function (num) {
	if(isNaN(num))
		num = parseInt(num);
	if(num.toString().indexOf('-') != -1)
		return true;
	return false;
});

hbs.registerHelper('time', function (date) {
	return dateFormat(date, "yyyy-mm-dd");
});

hbs.registerHelper('comparison', function(value , max){
  return (value < max) ? true: false;
});