
const { execFile } = require('child_process');
const func = require('../util/util');
const path = require('path');

exports.getPlayer = (req, res, next) => {
  // 사용자ID를 넣는 부분, 넘겨줄 ID가 없는 경우 중복로그인제한 회피를 위해 Unique 한 ID 로 랜덤처리 필요.
  const UserID = 'mobileid'; // req.user.user_id;

  // AquaAuth 파라메터 설정
  // 당사에서 정해진 고정된 값 ,5자로 제한
  const MasterKey = 'orgnm';

  // 사용자 및 웹서버 IP 정보
  // const UserIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const ServerIP = '127.0.0.1'; // req.connection.localAddress;
  const TimeOut = '300';

  // AquaAuth 사용 여부
  // 1: 사용함 (default)
  // 0 :사용안함
  const AquaAuth = '1';

  // 웹서버 시간정보
  const WebserverTime = func.microtime(true);

  // 중복로그인 차단 사용 여부
  // 0: 사용안함 (default)
  // 1: 선 사용자 허용, 후 사용자 차단
  // 2: 후 사용자 허용, 선 사용자 차단
  const AUTH_DUP_USER = '2';

  // 중복로그인 차단 범위 입력
  // 1: CP 별 차단
  // 2: 도메인 별 차단 (default)
  const AUTH_DUP_SCOPE = '1';

  // 중복로그인 차단 주기 (default: 60초)
  const AUTH_DUP_CYCLE = '20';

  // Custom을 구분하는 ID 값.
  // Dup_scope 가 1(CP별 차단)로 입력된 경우만 사용
  const AUTH_DUP_CP_KEY = 'orangenamu';

  // 사용자 기기 정보 수집
  // const NotifyInfo = 'http://' + req.headers.host + '/player/notify';
  // $NotifyInfo = "http://~webserver~/notifyinfo/getuserinfo.php?POST:BA:data=USERID,MAC,HDD,USERIP";

  // 암호화 되기 전 파라미터 선언
  let param;
  param = 'MasterKey=' + MasterKey;
  param += '&userid=' + UserID;
  // param += '&userip=' + UserIP;
  param += '&serverip=' + ServerIP;
  param += '&WebServerTime=' + WebserverTime;
  param += '&AquaAuth=' + AquaAuth;
  param += '&timeout=' + TimeOut;
  param += '&dup_user=' + AUTH_DUP_USER;
  param += '&dup_scope=' + AUTH_DUP_SCOPE;
  param += '&dup_cycle=' + AUTH_DUP_CYCLE;
  param += '&dup_custom_key=' + AUTH_DUP_CP_KEY;
  if (req.query.device_type === 'iOS') {
    param += '&return_url=' + 'http://m.dev.edu1004.kr';
  }
  param += '&wm_pos=' + '8';
  param += '&wm_text=' + UserID;
  param += '&url=' + 'http://mst.aquan.dev.edu1004.kr/orangenamu/dev/cdnetworks.mp4';
  // param += '&NotifyInfo=' + NotifyInfo;

  // console.log(param);

  execFile(path.join(__dirname, 'aquaplayer_modules/ENCAQALINK_V2_x64'),
    [ '-t', 'ENC', param ],
    (err, stdout, stderr) => {
      if (err) {
        throw err;
      }
      console.log(stdout);

      const iosUrl = 'cdnmp://cddr_dnp/webstream?param=' + stdout;
      const androidUrl = 'intent://cddr_dnp/webstream?param=' + stdout + '#Intent;scheme=cdnmp;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.cdn.aquanmanager;end';

      if (req.query.device_type === 'iOS') {
        return res.send({
          iosUrl: iosUrl
        });
      } else if (req.query.device_type === 'Android') {
        res.location(androidUrl);
        res.end;
      }
    }
  );
};

exports.demo = (req, res, next) => {
  res.render('aquaplayer', {
    current_path: 'aquaplayer'
  });
};
