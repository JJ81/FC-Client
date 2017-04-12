
exports.getImageInfo = (host) => {
  let logoImageName;
  let logoName;

  switch (host) {
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
  return {
    logoImageName: logoImageName,
    logoName: logoName
  };
};
