'use strict';
window.define([
  'jquery',
  'axios',
  'download',
  'handlebars',
  'es6-promise',
  'jqueryMarquee'
], function ($, axios, download, Handlebars) {
  window.axios = axios;
  // https://github.com/stefanpenner/es6-promise 참고
  require('es6-promise').polyfill();
  window.Handlebars = Handlebars;

  $(function () {
    // 공지사항 조회
    axios.get('/api/v1/notices')
      .then(function (res) {
        // console.log(res.data.list);
        if (res.data.list.length > 0) {
          $('.marquee').show();

          res.data.list.forEach(notice => {
            $('.marquee').append('<li><a href="/notice/' + notice.id + '">' + notice.title + '</a></li>');
          });

          $('.marquee').marquee({
            // duration in milliseconds of the marquee
            duration: 5000,
            // gap in pixels between the tickers
            gap: 50,
            // 'left' or 'right'
            direction: 'up',
            // true or false - should the marquee be duplicated to show an effect of continues flow
            duplicated: true,
            pauseOnHover: true
          });
        }
      })
      .catch(function (err) {
        console.error(err);
      });
  });

  $('#notice-file').on('click', function (event) {
    event.preventDefault();

    const filename = $(event.currentTarget).data('filename');

    axios({
      method: 'post',
      url: '/api/v1/s3-download',
      data: {
        key: $(event.currentTarget).data('url')
      },
      responseType: 'blob'
    })
      .then(response => {
        download(response.data, filename);
      })
      .catch(err => console.log(err));
  });

  return {
    getAllUrlParams: function (url) {
      // get query string from url (optional) or window
      var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

      // we'll store the parameters here
      var obj = {};

      // if query string exists
      if (queryString) {
        // stuff after # is not part of query string, so get rid of it
        queryString = queryString.split('#')[0];

        // split our query string into its component parts
        var arr = queryString.split('&');

        for (var i = 0; i < arr.length; i++) {
          // separate the keys and the values
          var a = arr[i].split('=');

          // in case params look like: list[]=thing1&list[]=thing2
          var paramNum;
          var paramName = a[0].replace(/\[\d*\]/, function (v) {
            paramNum = v.slice(1, -1);
            return '';
          });

          // set parameter value (use 'true' if empty)
          var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

          // (optional) keep case consistent
          paramName = paramName.toLowerCase();
          paramValue = paramValue.toLowerCase();

          // if parameter name already exists
          if (obj[paramName]) {
            // convert value to array (if still string)
            if (typeof obj[paramName] === 'string') {
              obj[paramName] = [obj[paramName]];
            }
            // if no array index number specified...
            if (typeof paramNum === 'undefined') {
              // put the value on the end of the array
              obj[paramName].push(paramValue);
            } else {
              // if array index number specified...
              // put the value at that index number
              obj[paramName][paramNum] = paramValue;
            }
          } else {
            // if param name doesn't exist yet, set it
            obj[paramName] = paramValue;
          }
        }
      }

      return obj;
    },

    getOSName: function () {
      var OSName = 'Unknown OS';

      if (navigator.appVersion.indexOf('Win') !== -1) OSName = 'Windows';
      if (navigator.appVersion.indexOf('Mac') !== -1) OSName = 'MacOS';
      if (navigator.appVersion.indexOf('X11') !== -1) OSName = 'UNIX';
      if (navigator.appVersion.indexOf('Linux') !== -1) OSName = 'Linux';

      return OSName;
    }
  };
});
