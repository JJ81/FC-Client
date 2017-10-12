var hbs = require('hbs');
// var moment = require('moment');
var currencyFormatter = require('currency-formatter');
var dateFormat = require('dateformat');

hbs.registerHelper('paginate', require('handlebars-paginate'));

hbs.registerHelper('isEquals', function (a, b) {
  return (a === b);
});

hbs.registerHelper('isEmpty', function (a) {
  return (a === '' || a === null);
});

hbs.registerHelper('comma-number', function (num) {
  (num === null) ? num = 0 : null;
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
});

hbs.registerHelper('currency', function (num) {
  return currencyFormatter.format(num, { code: 'USD' });
});

hbs.registerHelper('checkMinus', function (num) {
  if (isNaN(num)) { num = parseInt(num); }
  if (num.toString().indexOf('-') != -1) { return true; }
  return false;
});

hbs.registerHelper('time', function (date) {
  return dateFormat(date, 'yyyy-mm-dd');
});

hbs.registerHelper('stime', function (date) {
  return dateFormat(date, 'yy.m.d HH:MM');
});

hbs.registerHelper('dateformat', function (date, format) {
  return dateFormat(date, format);
});

hbs.registerHelper('comparison', function (value, max) {
  return (value < max);
});

// 비교연산자 헬퍼
// 참고 : http://bdadam.com/blog/comparison-helper-for-handlebars.html
// 사용법 : {{#ifCond var1 '==' var2}} {{/ifCond}}
(function () {
  function checkCondition (v1, operator, v2) {
    switch (operator) {
    case '==':
      return (v1 == v2);
    case '===':
      return (v1 === v2);
    case '!==':
      return (v1 !== v2);
    case '<':
      return (v1 < v2);
    case '<=':
      return (v1 <= v2);
    case '>':
      return (v1 > v2);
    case '>=':
      return (v1 >= v2);
    case '&&':
      return (v1 && v2);
    case '||':
      return (v1 || v2);
    default:
      return false;
    }
  }

  hbs.registerHelper('ifCond', function (v1, operator, v2, options) {
    return checkCondition(v1, operator, v2) ? options.fn(this) : options.inverse(this);
  });
}());

// str 을 len 길이만큼 자른다.
// 참고 : https://gist.github.com/TastyToast/5053642#gistcomment-930849
// 사용법 : {{truncate index.desc 120}}
// 사용처 : 강의 설명을 일부만 노출시킬 경우 사용
hbs.registerHelper('truncate', function (str, len) {
  if (str && str.length > len && str.length > 0) {
    var new_str = str + ' ';
    new_str = str.substr(0, len);
        // new_str2 = str.substr (0, new_str.lastIndexOf(" "));
        // new_str = (new_str2.length > 0) ? new_str2 : new_str;

    return new hbs.SafeString(new_str + '...');
  }
  return str;
});

hbs.registerHelper('addOneForIndex', function (num) {
  return parseInt(num) + 1;
});
