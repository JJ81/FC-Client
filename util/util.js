
exports.getLogoInfo = (req, res, next) => {
  let logoImageName;
  let logoName;
  let theme;

  switch (req.headers.host) {
  // case 'm.vodaeyewear.orangenamu.net':
  //   logoImageName = 'vodaeyewear.png';
  //   logoName = '보다안경원';
  //   theme = 'skin-green-light';
  //   break;
  case 'm.waffle.edu1004.kr':
    logoImageName = 'waffle.kosc.png';
    logoName = '와플대학';
    theme = 'skin-red-light';
    break;
  case 'm.momstouch.edu1004.kr':
    logoImageName = 'momstouch.png';
    logoName = '맘스터치';
    theme = 'skin-momstouch';
    break;
  case 'm.dev.edu1004.kr':
  default:
    logoImageName = 'orangenamu.png';
    logoName = '오렌지나무시스템';
    theme = 'skin-yellow-light';
    break;
  }
  res.locals.logoImageName = logoImageName;
  res.locals.logoName = logoName;
  res.locals.theme = theme;

  return next();
};

exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};
exports.isTermsApproved = (req, res, next) => {
  if (req.user.terms_approved === 1) {
    return next();
  }
  res.redirect('/terms');
};

exports.microtime = (getAsFloat) => {
  // php microtime 함수를 javascript 로 제작
  // https://stackoverflow.com/questions/38758655/php-microtime-in-javascript-or-angularjs
  var s, now, multiplier;

  now = (Date.now ? Date.now() : new Date().getTime()) / 1000;
  multiplier = 1e3; // 1,000

  // Getting microtime as a float is easy
  if (getAsFloat) {
    return Math.round(now);
  }

    // Dirty trick to only get the integer part
  s = now | 0;

  return (Math.round((now - s) * multiplier) / multiplier) + ' ' + s;
};
