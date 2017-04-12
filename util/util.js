
exports.getLogoInfo = (req, res, next) => {
  let logoImageName;
  let logoName;
  let theme;

  switch (req.headers.host) {
  case 'm.vodaeyewear.orangenamu.net':
    logoImageName = 'vodaeyewear.png';
    logoName = '보다안경원';
    theme = 'skin-green-light';
    break;
  case 'm.waffle.kosc.orangenamu.net':
    logoImageName = 'waffle.kosc.png';
    logoName = '와플대학';
    theme = 'skin-red-light';
    break;
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
