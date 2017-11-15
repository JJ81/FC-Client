'use strict';
window.requirejs(
  ['common'],
  function (Util) {
    window.$('#start-player').on('click', function () {
      console.log('start!');
      startPlayer();
    });

    function getDeviceType () {
      if ((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPad/i))) {
        return 'ios';
      } else if (navigator.userAgent.match(/Android/i)) {
        return 'android';
      } else if (navigator.userAgent.match(/Mac/i)) {
        return 'mac';
      }
    };

    function startPlayer () {
      var deviceType = getDeviceType();

      window.axios.get('/api/v1/aquaplayer', {
        params: {
          userid: 123,
          device_type: deviceType
        }
      })
      .then(function (res) {
        console.log(res.data);
        if (deviceType === 'iOS') {
          var time = (new Date()).getTime();
          console.log(res.data.iosUrl);
          window.location.href = res.data.iosUrl;

          setTimeout(function () {
            setTimeout(function () {
              var now = (new Date()).getTime();
              if ((now - time) < 400) {
                window.location = 'https://itunes.apple.com/kr/app/aquanmanager/id1048325731';
              }
            }, 10);
          }, 300);
        } else if (deviceType === 'Android') {
          console.log(res.data.androidUrl);
          window.location.href = res.data.androidUrl;
        }
      })
      .catch(function (err) {
        console.log(err);
      });
    };
  }
);
