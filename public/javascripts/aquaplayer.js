'use strict';
window.requirejs(
  ['jquery', 'axios'],
  function ($, axios) {
    var deviceType;

    $(function () {
      getDeviceType();
    });

    $('#start-player').on('click', function () {
      console.log('start!');
      startPlayer();
    });

    var getDeviceType = function () {
      console.log(navigator.userAgent);
      if ((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPad/i))) {
        deviceType = 'iOS';
      } else if (navigator.userAgent.match(/Android/i)) {
        deviceType = 'Android';
      } else if (navigator.userAgent.match(/Mac/i)) {
        deviceType = 'Mac';
      }
    };

    var startPlayer = function () {
      console.log(deviceType);
      axios.get('/api/v1/aquaplayer', {
        params: {
          userid: 123,
          device_type: deviceType
        }
      })
      .then(function (res) {
        // console.log(res.data);

        if (deviceType === 'iOS') {
          var time = (new Date()).getTime();
          window.location.href = res.data.iosUrl;

          setTimeout(function () {
            setTimeout(function () {
              window.alert('time : ' + time);
              window.alert('device type :', deviceType);

              var now = (new Date()).getTime();
              if ((now - time) < 400) {
                window.location = 'https://itunes.apple.com/kr/app/aquanmanager/id1048325731';
              }
            }, 10);
          }, 300);
        }
      })
      .catch(function (err) {
        console.log(err);
      });
    };
  }
);
