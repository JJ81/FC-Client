'use strict';
window.requirejs(
  ['jquery', 'axios'],
  function ($, axios) {
    $(function () {
      axios.get('/api/v1/player/encparam', {
        params: {
          userid: 123
        }
      })
      .then(function (res) {
        console.log(res.data);
      })
      .catch(function (err) {
        console.log(err);
      });

      // var time = (new Date()).getTime();

      // window.location.href = '<%=iosUrl%>';

      // setTimeout(function () {
      //   setTimeout(function () {
      //     var now = (new Date()).getTime();
      //     if ((now - time) < 400) {
      //       window.location = 'https://itunes.apple.com/kr/app/aquanmanager/id1048325731';
      //     }
      //   }, 10);
      // }, 300);
    });
  }
);
