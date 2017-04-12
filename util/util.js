
exports.getLogoInfo = (req, res, next) => {
  let logoImageName;
  let logoName;

  switch (req.headers.host) {
  case 'm.vodaeyewear.orangenamu.net':
    logoImageName = 'vodaeyewear.png';
    logoName = '보다안경원';
    break;
  case 'm.waffle.kosc.orangenamu.net':
    logoImageName = 'waffle.kosc.png';
    logoName = '와플대학';
    break;
  default:
    logoImageName = 'orangenamu.png';
    logoName = '오렌지나무시스템';
    break;
  }
  res.locals.logoImageName = logoImageName;
  res.locals.logoName = logoName;

  return next();
  // return {
  //   logoImageName: logoImageName,
  //   logoName: logoName
  // };
};

exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};
