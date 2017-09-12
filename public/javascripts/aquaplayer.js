'use strict';
window.requirejs(
  ['jquery', 'axios'],
  function ($, axios) {
    $(function () {
    });

    $('#start-player').on('click', function () {
      console.log('start!');
      startPlayer();
    });

    function getDeviceType () {
      if ((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPad/i))) {
        return 'iOS';
      } else if (navigator.userAgent.match(/Android/i)) {
        return 'Android';
      } else if (navigator.userAgent.match(/Mac/i)) {
        return 'Mac';
      }
    };

    function startPlayer () {
      var deviceType = getDeviceType();

      axios.get('/api/v1/aquaplayer', {
        params: {
          userid: 123,
          device_type: deviceType
        }
      })
      .then(function (res) {
        if (deviceType === 'iOS') {
          var time = (new Date()).getTime();
          window.location.href = res.data.iosUrl;

          setTimeout(function () {
            setTimeout(function () {
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
