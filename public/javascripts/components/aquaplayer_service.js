'use strict';
window.define([
  'common',
  'axplugin',
  'nplayer',
  'nplayer_ui',
  'cdnproxy',
  'nplayer_conf'
], function (Util, ax) {
  var self = null;
  var encodedParam;
  var player;
  var $ = $ || window.$;

  function AquaPlayerService (options) {
    self = this;

    self.extendOptions(options);
    self.init();
  }

  AquaPlayerService.prototype = {
    // 옵션 저장 변수
    options: {},
    extend: function (a, b) {
      for (var key in b) {
        if (b.hasOwnProperty(key)) {
          a[key] = b[key];
        }
      }
      return a;
    },
    // 옵션 확장
    extendOptions: function (options) {
      this.options = this.extend({}, this.options);
      this.extend(this.options, options);
    },
    // 컴포넌트 초기화
    init: function () {
      self.getEncodedParam();
      self.resize();
    },
    initPlayer: function () {
      $(window).resize();

      self.options.html5 = Util.getOSName() !== 'Windows';

      if (self.options.html5) {
        self.initPlayerHTML();
      } else if ('ActiveXObject' in window) {
        self.initPlayerWindow();
      }
    },
    // Player 초기화
    initPlayerHTML: function () {
      player = new window.NPlayer('video', {
        controlBox: 'nplayer_control.html',
        visible: false,
        mode: 'html5'
      });

      window.player = player;

      window.initNPlayerUI(player);

      player.bindEvent('Ready', function () {
        // self.reportMessage('ready');
        window.setSecurePage(true);

        window.proxy_init(function () {
          // 1. video start set
          window.setPlayerStart(true);
          // 2. nplayer instance set
          window.setNPlayer(player);
          // 4. media info set
          window.mygentAuthCall(function (genkey) {
            window.setMediaInfo(self.options.fileUrl, genkey);

            var url = window.getMediaURL(true);
            player.open({
              'URL': window.encodeURI(url)
            });

            // 외부 모듈에서 플레이어 이벤트를 감지하기 위한 용도
            self.options.callback(player);
          }, encodedParam);
        }, window.indicateInstall, window.indicateUpdate);
      });

      player.bindEvent('OpenStateChanged', function (state) {
        // self.reportMessage('OpenStateChanged');

        switch (state) {
        case window.NPlayer.OpenState.Opened:
          player.setVisible(true);
          window.starthtml5State();
          break;
        case window.NPlayer.OpenState.Closed:
          window.Stophtml5State(window.NPlayer.OpenState.Closed);
          break;
        }
      });

      player.bindEvent('PlayStateChanged', function (state) {
        // self.reportMessage('PlayStateChanged');

        switch (state) {
        case window.NPlayer.PlayState.Playing:
          player.setVisible(true);
          break;

        case window.NPlayer.PlayState.Stopped:
          player.setVisible(false);
          break;

        case window.NPlayer.PlayState.Paused:
          player.setVisible(true);
          break;
        }
      });

      player.bindEvent('GuardCallback', function (name, desc) {
        self.reportMessage('GuardCallback - ' + name + ' : ' + desc);
      });

      player.bindEvent('Error', function (ec) {
        self.reportMessage('Error - ' + ec);
      });
    },
    initPlayerWindow: function () {
      // self.options.fileUrl = 'http://eng-media-02.cdngc.net/cdnlab/cs1/tsbox/CSS_1500k.mp4';

      player = new window.NPlayer('video', {
        controlBox: 'nplayer_control.html',
        visible: false
      });
      var setAxPlugin = false;

      window.player = player;
      self.testWatermark();

      window.initNPlayerUI(player);

      player.bindEvent('Ready', function () {
        // self.reportMessage('Ready');

        player.setCDNAuthParam(encodedParam);
        player.addContextMenu('SystemInfo', 'sysinfo');

        // console.log(window.encodeURI(self.options.fileUrl));

        player.open({
          'URL': window.encodeURI(self.options.fileUrl)
        });

        // 외부 모듈에서 플레이어 이벤트를 감지하기 위한 용도
        self.options.callback(player);
      });

      player.bindEvent('OpenStateChanged', function (state) {
        // self.reportMessage('OpenStateChanged');

        switch (state) {
        case window.NPlayer.OpenState.Opened:
          player.setVisible(true);
          break;
        case window.NPlayer.OpenState.Closed:
          break;
        }
      });

      player.bindEvent('PlayStateChanged', function (state) {
        // self.reportMessage('PlayStateChanged');

        switch (state) {
        case window.NPlayer.PlayState.Playing:
          player.setVisible(true);

          // if (ax.isDup === true) {
          //   player.stop();
          //   window.alert(window.NPLAYER_DUP_MSG);
          //   break;
          // }

          if (setAxPlugin === true) {
            window.AquaAxPlugin.PlayState = window.NPlayer.PlayState.Playing;
            window.AquaAxPlugin.OpenStateChange();
          }
          break;

        case window.NPlayer.PlayState.Stopped:
          player.setVisible(false);
          break;

        case window.NPlayer.PlayState.Paused:
          player.setVisible(true);

          if (setAxPlugin === true) {
            window.AquaAxPlugin.PlayState = window.NPlayer.PlayState.Paused;
            window.AquaAxPlugin.OpenStateChange();
          }
          break;
        }
      });

      player.bindEvent('GuardCallback', function (name, desc) {
        if (setAxPlugin === true) window.AquaAxPlugin.SendPVLog(name, desc);
      });

      player.bindEvent('Error', function (ec) {
        console.log('err', ec);
        $('#video').css('background-image', 'none');
      });

      player.bindEvent('ContextMenu', function (val) {
        if (val === 'sysinfo') {
          if (setAxPlugin === true) {
            window.AquaAxPlugin.LoadSystemInfomation();
            window.alert(
              'CPU 정보 : ' + window.AquaAxPlugin.DeviceCPU + '\n' +
              'MEM 정보 : ' + window.AquaAxPlugin.DeviceMem + '\n' +
              'GPU 정보 : ' + window.AquaAxPlugin.DeviceGPU + '\n\n' +
              'IP 정보 : ' + window.AquaAxPlugin.DeviceIP + '\n' +
              'Mac 정보 : ' + window.AquaAxPlugin.DeviceMac + '\n' +
              'OS 정보 : ' + window.AquaAxPlugin.DeviceOSDesc + '\n' +
              '해상도 정보 : ' + window.AquaAxPlugin.DeviceMonitor + '\n' +
              'IE 버전 : ' + window.AquaAxPlugin.DeviceIE + '\n'
            );
          }
        }
      });

      window.onunload = function () {
        if (setAxPlugin === true) window.AquaAxPlugin.FinalizeAuth();
      };
    },
    // encparam 을 서버에서 생성하여 전달받는다.
    getEncodedParam: function () {
      window.axios.get('/api/v1/player/encparam')
        .then(function (res) {
          encodedParam = res.data.encparam;
          // self.reportMessage(encodedParam);
          self.initPlayer();
        })
        .catch(function (err) {
          self.reportError(err);
        }
      );
    },
    reportMessage: function (msg) {
      console.log('aquaservice : ' + msg);
    },
    reportError: function (err) {
      console.log('aquaservice : ' + err);
    },
    resize: function () {
      $(window).resize(function () {
        $('#video').height($(window).height() - $('.wrapper_foot').height());
        // if (window.player && !window.player.getFullscreen()) {
        //   console.log('resized-1');
        //   $('#video').height($(window).height());
        // } else {
        //   console.log('resized-2');
        //   $('#video').height($(window).height() - $('.wrapper_foot').height());
        // }
      });
    },
    testWatermark () {
      window.player.setWatermarkText(self.options.watermark);
      window.player.setWatermarkSize(15);
      window.player.setWatermarkColor(255, 0, 0, 0.5);
      window.player.setWatermarkInterval(5);
      window.player.setWatermarkLocation(22);
    },
    testSubtitle: function () {
      self.testSubtitle1();
    },
    testSubtitle1: function () {
      window.setTimeout(function () {
        window.player.setSubtitleFont('궁서', 25);
        window.player.setSubtitleColor(255, 0, 0, 0.5);
        window.player.setSubtitlePosition(100, 100);
        window.player.setSubtitleText('Hello, World - 테스트 1');
        self.testSubtitle2();
      }, 1000);
    },
    testSubtitle2: function () {
      window.setTimeout(function () {
        window.player.setSubtitleFont('Malgun Gothic', 15);
        window.player.setSubtitleColor(0, 255, 0, 1);
        window.player.setSubtitlePosition(200, 50);
        window.player.setSubtitleText('Hello, World - 테스트 2');
        self.testSubtitle3();
      }, 1000);
    },
    testSubtitle3 () {
      window.setTimeout(function () {
        window.player.setSubtitleFont('굴림', 35);
        window.player.setSubtitleColor(0, 0, 255, 0.7);
        window.player.setSubtitlePosition(50, 200);
        window.player.setSubtitleText('Hello, World - 테스트 3');
        self.testSubtitle1();
      }, 1000);
    }
  };

  return AquaPlayerService;
});
