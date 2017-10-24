var g__nplayer_index__ = 0;
var g__json_callback_index__ = 0;
var g__json_callback__ = [];

function getJSON (b, c) {
  var a = document.createElement('script');
  g__json_callback__[++g__json_callback_index__] = function (d) {
    c(d);
    document.body.removeChild(a);
    g__json_callback__.splice(g__json_callback_index__, 1);
  };
  a.src = b.replace('callback=?', 'callback=g__json_callback__[' + g__json_callback_index__ + ']');
  document.body.appendChild(a);
}

function isIE () {
  return window.ActiveXObject || navigator.appName == 'Microsoft Internet Explorer' || navigator.userAgent.match(/MSIE/i) || navigator.userAgent.match(/Trident/i);
}

function JSONstringify (e) {
  var d = typeof (e);
  if (d != 'object' || e === null) {
    if (d == 'string') {
      e = '"' + e + '"';
    }
    return String(e);
  } else {
    var f, b, c = [],
      a = (e && e.constructor == Array);
    for (f in e) {
      b = e[f];
      d = typeof (b);
      if (d == 'string') {
        b = '"' + b + '"';
      } else {
        if (d == 'object' && b !== null) {
          b = JSONstringify(b);
        }
      }
      c.push((a ? '' : '"' + f + '":') + String(b));
    }
    return (a ? '[' : '{') + String(c) + (a ? ']' : '}');
  }
}

function _NPlayerNull () {
  this.open = function (a) {};
  this.close = function () {};
  this.play = function () {};
  this.pause = function () {};
  this.stop = function () {};
  this.getOpenState = function () {
    return null;
  };
  this.getPlayState = function () {
    return null;
  };
  this.getDuration = function () {
    return 0;
  };
  this.getCurrentPlaybackTime = function () {
    return 0;
  };
  this.setCurrentPlaybackTime = function (a) {};
  this.getCurrentPlaybackRate = function () {
    return 1;
  };
  this.setCurrentPlaybackRate = function (a) {};
  this.getNearestKeyframeTimestamp = function (a) {
    return a;
  };
  this.setPlaybackRange = function (b, a) {};
  this.addContextMenu = function (b, a) {};
  this.getVolume = function () {
    return 0;
  };
  this.setVolume = function (a) {};
  this.getMute = function () {
    return false;
  };
  this.setMute = function (a) {};
  this.getFullscreen = function () {
    return false;
  };
  this.setFullscreen = function (a) {};
  this.getRepeatPointA = function () {
    return -1;
  };
  this.setRepeatPointA = function (a) {};
  this.resetRepeatPointA = function () {};
  this.getRepeatPointB = function () {
    return -1;
  };
  this.setRepeatPointB = function (a) {};
  this.resetRepeatPointB = function () {};
  this.getBeginPlaybackPosition = function () {
    return -1;
  };
  this.getEndPlaybackPosition = function () {
    return -1;
  };
  this.getVisible = function () {
    return true;
  };
  this.setVisible = function (a) {};
  this.attachEvent = function (a, b) {};
  this.command = function (a, b) {};
  this.setCDNAuthParam = function (a) {};
  this.setPlayItem = function (a) {};
  this.setSubtitleFont = function (a, b) {};
  this.setSubtitleColor = function (f, e, c, d) {};
  this.setSubtitlePosition = function (a, b) {};
  this.setSubtitleText = function (a) {};
  this.setWatermarkText = function (a) {};
  this.setWatermarkSize = function (a) {};
  this.setWatermarkColor = function (f, e, c, d) {};
  this.setWatermarkLocation = function (a) {};
  this.setWatermarkInterval = function (a) {};
  this.setWatermarkDuration = function (a) {};
  this.getSeekable = function () {
    return false;
  };
  this.setSeekable = function (a) {};
  this.getBrightness = function () {
    return 0;
  };
  this.setBrightness = function (a) {};
  this.getContrast = function () {
    return 0;
  };
  this.setContrast = function (a) {};
  this.getSaturation = function () {
    return 0;
  };
  this.setSaturation = function (a) {};
  this.getFrameStep = function () {
    return 0;
  };
  this.setFrameStep = function (a) {};
  this.getDeviceID = function () {};
}

function _NPlayerPlugin (c) {
  var a = this;
  var d = false;
  var b = 30;
  this.open = function (e) {
    c.open(e);
  };
  this.close = function () {
    c.close();
  };
  this.play = function () {
    c.play();
  };
  this.pause = function () {
    c.pause();
  };
  this.stop = function () {
    c.stop();
  };
  this.getOpenState = function () {
    return c.openState;
  };
  this.getPlayState = function () {
    return c.playState;
  };
  this.getDuration = function () {
    return c.duration;
  };
  this.getCurrentPlaybackTime = function () {
    return c.currentPlaybackTime;
  };
  this.setCurrentPlaybackTime = function (e) {
    c.currentPlaybackTime = e;
  };
  this.getCurrentPlaybackRate = function () {
    return c.currentPlaybackRate;
  };
  this.setCurrentPlaybackRate = function (e) {
    c.currentPlaybackRate = e;
  };
  this.getNearestKeyframeTimestamp = function (e) {
    return c.getNearestKeyframeTimestamp(e);
  };
  this.setPlaybackRange = function (f, e) {
    c.setPlaybackRange(f, e);
  };
  this.addContextMenu = function (f, e) {
    c.addContextMenu(f, e);
  };
  this.getVolume = function () {
    return c.volume;
  };
  this.setVolume = function (e) {
    c.volume = e;
  };
  this.getMute = function () {
    return c.muted;
  };
  this.setMute = function (e) {
    c.muted = e;
  };
  this.getFullscreen = function () {
    return c.fullscreen;
  };
  this.setFullscreen = function (e) {
    c.fullscreen = e;
  };
  this.getRepeatPointA = function () {
    return c.repeatPointA;
  };
  this.setRepeatPointA = function (e) {
    c.repeatPointA = e;
  };
  this.resetRepeatPointA = function () {
    c.repeatPointA = -1;
  };
  this.getRepeatPointB = function () {
    return c.repeatPointB;
  };
  this.setRepeatPointB = function (e) {
    c.repeatPointB = e;
  };
  this.resetRepeatPointB = function () {
    c.repeatPointB = -1;
  };
  this.getBeginPlaybackPosition = function () {
    return c.beginPlaybackPosition;
  };
  this.getEndPlaybackPosition = function () {
    return c.endPlaybackPosition;
  };
  this.getVisible = function () {
    return d;
  };
  this.setVisible = function (g) {
    try {
      if (isIE()) {
        if (g) {
          c.width = '100%';
          c.height = '100%';
        } else {
          c.width = '1px';
          c.height = '1px';
        }
      } else {
        c.style.visibility = g ? 'visible' : 'hidden';
      }
    } catch (f) {}
    d = true;
  };
  this.attachEvent = function (e, f) {
    c.attachEvent(e, f);
  };
  this.command = function (e, f) {
    c.command(e, f);
  };
  this.setCDNAuthParam = function (e) {
    c.CDNAuthParam = e;
  };
  this.setPlayItem = function (e) {
    c.playItem = JSONstringify(e);
  };
  this.setSubtitleFont = function (e, f) {
    c.setSubtitleFont(e);
    c.setSubtitleFontSize(f);
  };
  this.setSubtitleColor = function (i, h, e, f) {
    c.setSubtitleColor(i, h, e, f);
  };
  this.setSubtitlePosition = function (e, f) {
    c.setSubtitlePos(e, f);
  };
  this.setSubtitleText = function (e) {
    c.setSubtitleText(e);
  };
  this.setWatermarkText = function (e) {
    c.setWatermarkText(e);
  };
  this.setWatermarkSize = function (e) {
    c.setWatermarkSize(e);
  };
  this.setWatermarkColor = function (i, h, e, f) {
    c.setWatermarkColor(i, h, e, f);
  };
  this.setWatermarkLocation = function (e) {
    c.setWatermarkLocation(e);
  };
  this.setWatermarkInterval = function (e) {
    c.setWatermarkInterval(e);
  };
  this.setWatermarkDuration = function (e) {
    c.setWatermarkDuration(e);
  };
  this.getSeekable = function () {
    return c.seekable;
  };
  this.setSeekable = function (e) {
    c.seekable = e;
  };
  this.getBrightness = function () {
    return c.brightness;
  };
  this.setBrightness = function (e) {
    c.brightness = e;
  };
  this.getContrast = function () {
    return c.contrast;
  };
  this.setContrast = function (e) {
    c.contrast = e;
  };
  this.getSaturation = function () {
    return c.saturation;
  };
  this.setSaturation = function (e) {
    c.saturation = e;
  };
  this.getFrameStep = function () {
    if (typeof (c.frameStep) !== 'undefined') {
      return c.frameStep;
    } else {
      return b;
    }
  };
  this.setFrameStep = function (e) {
    if (typeof (c.frameStep) !== 'undefined') {
      c.frameStep = e;
    } else {
      b = e;
    }
  };
  this.getDeviceID = function () {
    return c.deviceID;
  };
}

function _NPlayerHtml5 (n, f) {
  var h = this;
  var l = false;
  var c = false;
  var b = NPlayer.OpenState.Closed;
  var j = NPlayer.PlayState.Stopped;
  var m = -1;
  var k = -1;
  var e = 30;

  function d (o) {
    if (h.onError) {
      h.onError(-1, o);
    }
  }
  this.open = function (o) {
    if (b != NPlayer.OpenState.Closed) {
      a(NPlayer.PlayState.Stopped);
      g(NPlayer.OpenState.Closing);
      g(NPlayer.OpenState.Closed);
    }
    $('source').remove();
    $('video').append('<source src="' + o + '" />');
    n.load();
    if (f.autoplay !== false) {
      n.play();
    }
  };
  this.close = function () {
    a(NPlayer.PlayState.Stopped);
    g(NPlayer.OpenState.Closing);
    c = true;
    n.src = 'http://null/';
    n.load();
  };
  this.play = function () {
    if (b != NPlayer.OpenState.Opened && b != NPlayer.OpenState.Opening) {
      return;
    }
    n.play();
  };
  this.pause = function () {
    if (b != NPlayer.OpenState.Opened) {
      return;
    }
    n.pause();
  };
  this.stop = function () {
    if (b != NPlayer.OpenState.Opened) {
      return;
    }
    l = true;
    n.pause();
    n.currentTime = 0;
  };
  this.getOpenState = function () {
    return b;
  };
  this.getPlayState = function () {
    return j;
  };
  this.getDuration = function () {
    return n.duration;
  };
  this.getCurrentPlaybackTime = function () {
    return n.currentTime;
  };
  this.setCurrentPlaybackTime = function (o) {
    n.currentTime = o;
  };
  this.getCurrentPlaybackRate = function () {
    return n.playbackRate;
  };
  this.setCurrentPlaybackRate = function (o) {
    n.playbackRate = o;
    n.defaultPlaybackRate = o;
  };
  this.getNearestKeyframeTimestamp = function (o) {
    return o;
  };
  this.setPlaybackRange = function (p, o) {};
  this.addContextMenu = function (p, o) {};
  this.getVolume = function () {
    return n.volume;
  };
  this.setVolume = function (o) {
    if (o < 0) {
      o = 0;
    } else {
      if (o > 1) {
        o = 1;
      }
    }
    n.muted = false;
    n.volume = o;
  };
  this.getMute = function () {
    return n.muted;
  };
  this.setMute = function (o) {
    if (b != NPlayer.OpenState.Opened) {
      return;
    }
    n.muted = o;
  };
  this.getFullscreen = function () {
    return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
  };
  this.setFullscreen = function (p) {
    if (document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled) {
      if (p) {
        var o = n;
        if (typeof g__fullscreen_layout_id__ !== 'undefined' && document.getElementById(g__fullscreen_layout_id__)) {
          o = document.getElementById(g__fullscreen_layout_id__);
        }
        if (o.requestFullscreen) {
          o.requestFullscreen();
        } else {
          if (o.webkitRequestFullScreen) {
            o.webkitRequestFullScreen();
          } else {
            if (o.mozRequestFullScreen) {
              o.mozRequestFullScreen();
            } else {
              if (o.msRequestFullscreen) {
                o.msRequestFullscreen();
              }
            }
          }
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else {
          if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          } else {
            if (document.mozCancelFullScreen) {
              document.mozCancelFullScreen();
            } else {
              if (document.msExitFullscreen) {
                document.msExitFullscreen();
              }
            }
          }
        }
      }
    } else {}
  };
  this.getRepeatPointA = function () {
    if (m < 0 && k >= 0) {
      return 0;
    } else {
      return m;
    }
  };
  this.setRepeatPointA = function (o) {
    if (b != NPlayer.OpenState.Opened || j == NPlayer.PlayState.Stopped) {
      return;
    }
    if (m == o) {
      return;
    }
    m = o;
    if (m >= 0 && m > h.getRepeatPointB()) {
      m = h.getRepeatPointB();
    }
    if (m > h.getCurrentPlaybackTime()) {
      h.setCurrentPlaybackTime(m);
    }
    if (h.onRepeatPointAChanged) {
      h.onRepeatPointAChanged(m);
    }
  };
  this.resetRepeatPointA = function () {
    h.setRepeatPointA(-1);
  };
  this.getRepeatPointB = function () {
    if (k < 0 && m >= 0) {
      return n.duration;
    } else {
      return k;
    }
  };
  this.setRepeatPointB = function (o) {
    if (b != NPlayer.OpenState.Opened || j == NPlayer.PlayState.Stopped) {
      return;
    }
    if (k == o) {
      return;
    }
    k = o;
    if (h.onRepeatPointBChanged) {
      h.onRepeatPointBChanged(k);
    }
  };
  this.resetRepeatPointB = function () {
    h.setRepeatPointB(-1);
  };
  this.getBeginPlaybackPosition = function () {
    return -1;
  };
  this.getEndPlaybackPosition = function () {
    return -1;
  };
  this.getVisible = function () {
    n.style.visibility != 'hidden';
  };
  this.setVisible = function (o) {
    n.style.visibility = o ? 'visible' : 'hidden';
  };
  this.attachEvent = function (o, p) {
    h['on' + o] = p;
  };
  this.command = function (o, p) {};
  this.setCDNAuthParam = function (o) {};
  this.setPlayItem = function (o) {
    $('track').remove();
    if (o.Subtitles && o.Subtitles.length) {
      $('video').append('<track src="' + o.Subtitles[0].URL + '" label="Captions" kind="subtitles" default />');
    }
    h.open(o.URL);
  };
  this.setSubtitleFont = function (o, p) {};
  this.setSubtitleColor = function (s, q, o, p) {};
  this.setSubtitlePosition = function (o, p) {};
  this.setSubtitleText = function (o) {};
  this.setWatermarkText = function (o) {};
  this.setWatermarkSize = function (o) {};
  this.setWatermarkColor = function (s, q, o, p) {};
  this.setWatermarkLocation = function (o) {};
  this.setWatermarkInterval = function (o) {};
  this.setWatermarkDuration = function (o) {};
  this.getSeekable = function () {
    return false;
  };
  this.setSeekable = function (o) {};
  this.getBrightness = function () {
    return 0;
  };
  this.setBrightness = function (o) {};
  this.getContrast = function () {
    return 0;
  };
  this.setContrast = function (o) {};
  this.getSaturation = function () {
    return 0;
  };
  this.setSaturation = function (o) {};
  this.getFrameStep = function () {
    return e;
  };
  this.setFrameStep = function (o) {
    e = o;
  };
  this.getDeviceID = function () {};

  function g (o) {
    if (o == b) {
      return;
    }
    b = o;
    if (h.onOpenStateChanged) {
      h.onOpenStateChanged(b);
    }
  }

  function a (o) {
    j = o;
    if (h.onPlayStateChanged) {
      h.onPlayStateChanged(j);
    }
  }

  function i () {
    g(NPlayer.OpenState.Closed);
    h.resetRepeatPointA();
    h.resetRepeatPointB();
    if (h.onMuteChanged) {
      h.onMuteChanged(n.muted);
    }
  }
  n.addEventListener('loadstart', function () {
    if (c) {
      c = false;
      i();
    } else {
      g(NPlayer.OpenState.Opening);
    }
  }, false);
  n.addEventListener('loadeddata', function () {
    g(NPlayer.OpenState.Opened);
  }, false);
  n.addEventListener('durationchange', function () {}, false);
  n.addEventListener('suspend', function () {}, false);
  n.addEventListener('emptied', function () {}, false);
  n.addEventListener('playing', function () {
    a(NPlayer.PlayState.Playing);
  }, false);
  n.addEventListener('pause', function () {
    if (l) {
      l = false;
      a(NPlayer.PlayState.Stopped);
      h.resetRepeatPointA();
      h.resetRepeatPointB();
    } else {
      a(NPlayer.PlayState.Paused);
    }
  }, false);
  n.addEventListener('ended', function () {
    if (h.getRepeatPointA() != -1) {
      n.currentTime = h.getRepeatPointA();
      n.play();
      return;
    }
    if (h.onPlaybackCompleted) {
      h.onPlaybackCompleted();
    }
    h.stop();
  }, false);
  n.addEventListener('waiting', function () {}, false);
  n.addEventListener('error', function () {
    if (n.src == 'http://null/') {
      return;
    }
    var o;
    switch (n.error.code) {
    case 1:
      o = '비디오 재생을 중단하였습니다.';
      break;
    case 2:
      o = '네트워크 오류가 발생하였습니다.';
      break;
    case 3:
      o = '비디오 파일이 잘못되었거나 지원하지 않는 형식입니다.';
      break;
    case 4:
      o = '비디오를 재생할 수 없습니다. 서비스 장애가 발생하였거나 지원하지 않는 형식입니다.';
      break;
    default:
      o = '알 수 없는 오류가 발생하였습니다.';
      break;
    }
    if (h.onError) {
      h.onError(n.error.code, o);
    }
  }, false);
  n.addEventListener('ratechange', function () {
    if (h.onRateChanged) {
      h.onRateChanged(n.playbackRate);
    }
  }, false);
  n.addEventListener('volumechange', function () {
    if (h.onVolumeChanged) {
      h.onVolumeChanged(n.volume);
    }
    if (h.onMuteChanged) {
      h.onMuteChanged(n.muted);
    }
  }, false);
  n.addEventListener('timeupdate', function () {
    if (m >= 0 || k >= 0) {
      if (n.currentTime >= h.getRepeatPointB()) {
        n.currentTime = h.getRepeatPointA();
      }
      if (n.currentTime < h.getRepeatPointA()) {
        n.currentTime = h.getRepeatPointA();
      }
    }
    if (h.onUpdateTime) {
      h.onUpdateTime(n.currentTime);
    }
  }, false);
  window.addEventListener('unload', function () {
    if (b == NPlayer.OpenState.Closed) {
      return;
    }
    a(NPlayer.PlayState.Stopped);
    g(NPlayer.OpenState.Closing);
    g(NPlayer.OpenState.Closed);
  }, false);
  window.addEventListener('beforeunload', function () {
    if (b == NPlayer.OpenState.Closed) {
      return;
    }
    a(NPlayer.PlayState.Stopped);
    g(NPlayer.OpenState.Closing);
    g(NPlayer.OpenState.Closed);
  }, false);
  n.oncontextmenu = function (o) {
    if (typeof showContextMenu === 'function') {
      showContextMenu(o);
    } else {
      return false;
    }
  };
}

function NPlayer (A, E) {
  if (!E) {
    E = {};
  }
  var i = this;
  var C = A + ('-nplayer-' + ++g__nplayer_index__);
  var e = new _NPlayerNull();
  var D = E.visible != false;
  var t = 0;
  var o = 0;
  var f = 0;
  var F = 0;
  var s = 0;
  var x = false;
  var r = 30;
  var b;
  var j = 0;
  var I = 0;
  n();

  function y (M) {
    return document.getElementById(M);
  }

  function n () {
    if (E.mode == 'html5') {
      u();
    } else {
      if (navigator.platform == 'Win32') {
        if (isIE() || !A) {
          y(A) ? p() : q();
        } else {
          g();
        }
      } else {
        if (navigator.platform == 'Win64' && isIE()) {
          alert('IE 64비트 버전에서는 재생할 수 없습니다. IE 32비트 버전을 사용하십시오.');
          return;
        } else {
          u();
        }
      }
    }

    function M (O) {
      if (O && O.srcElement) {
        if (!(navigator.userAgent.search('MSIE 7.0') != -1 && document.documentMode > 7)) {
          if (O.srcElement.id == C) {
            return true;
          }
        }
        var N = O.srcElement.type;
        if (N == 'text' || N == 'textarea') {
          return true;
        }
      }
      if (i.onKeyDown) {
        if (i.onKeyDown(O.keyCode) != false) {
          return k(O.keyCode);
        }
      } else {
        return k(O.keyCode);
      }
    }
    if (document.body.addEventListener) {
      document.body.addEventListener('keydown', M, false);
    } else {
      document.body.attachEvent('onkeydown', M);
    }
    i.processKeyDown = M;
  }

  function c (O, N) {
    var M = O.replace(/,/g, '.').split('.');
    var S = N.replace(/,/g, '.').split('.');
    for (var Q = 3; Q >= 0; Q--) {
      var R = parseInt(M[Q]);
      var P = parseInt(S[Q]);
      if (R > P) {
        return 1;
      } else {
        if (R < P) {
          return -1;
        }
      }
    }
    return 0;
  }

  function q () {
    e = new _NPlayerPlugin(window.external);
    w();
    x = true;
  }

  function B () {
    return '<div id=\'' + C + '-msg\'></div>';
  }

  function K () {
    try {
      y('nplayer-tmp').innerHTML = '<object style=\'display:none\' id=\'' + C + '\' classid=\'CLSID:FE380CD7-670A-49B7-8A47-8E9DB67E5ED8\' width=\'100%\' height=\'100%\' codebase=\'' + NPLAYER_SETUP_URL + '#version=' + NPLAYER_VERSION + '\' ></object>';
      var M = y(C);
      if (!M.object) {
        return false;
      }
      return c(M.version, NPLAYER_VERSION) >= 0;
    } catch (N) {
      return false;
    }
  }

  function v () {
    var M = '<a href=\'' + NPLAYER_SETUP_URL + '\'><div id=\'nplayer-download-image\'></div></a><p>동영상을 시청하려면 <a style=\'color:#ff4f4f;text-decoration:none\' href=\'' + NPLAYER_SETUP_URL + '\'><span style=\'color:#00ff00\'>nPlayer</span> 설치 프로그램을 내려받아</a> 설치하여 주십시오.</p>';
    if (typeof (NPLAYER_INSTALL_MSG) === 'string') {
      M = NPLAYER_INSTALL_MSG;
    }
    return '<table width=\'100%\' height=\'100%\' style=\'color:#9f9f9f;background-color:black;font-size:14px\'><tr><td align=\'center\' valign=\'middle\'>' + M + '</td></tr></table>';
  }

  function L () {
    y('nplayer-install-msg').innerHTML = v();
  }

  function p () {
    var O = '';
    if (typeof (NPLAYER_USE_DSHOW) !== 'undefined') {
      O = '<param name=\'DShow\' value=\'' + (NPLAYER_USE_DSHOW == false ? 'false' : 'true') + '\' />';
    }
    var N = B() + '<object id=\'' + C + '\' classid=\'CLSID:{FE380CD7-670A-49B7-8A47-8E9DB67E5ED8}\' width=\'1px\' height=\'1px\' codebase=\'' + NPLAYER_SETUP_URL + '#version=' + NPLAYER_VERSION + '\' ><param name=\'ControlBoxUrl\' value=\'' + E.controlBox + '\' /><param name=\'GuardDataBaseUrl\' value=\'' + NPLAYER_GUARD_DB_URL + '\' />' + (E.auth ? '<param name=\'AuthUrl\' value=\'' + E.auth + '\' />' : '') + (E.guardFlags ? '<param name=\'GuardFlags\' value=\'' + E.guardFlags + '\' />' : '') + '<param name=\'AutoPlay\' value=\'' + (E.autoplay == false ? 'false' : 'true') + '\' /><param name=\'Seekable\' value=\'' + (E.seekable == false ? 'false' : 'true') + '\' />' + O + '</object><span id=\'nplayer-install-msg\'></span>';
    y(A).innerHTML += N;
    if (y(C).object) {
      e = new _NPlayerPlugin(y(C));
      if (E.visible != false) {
        e.setVisible(true);
      }
      w();
    } else {
      L();
      var M = window.setInterval(function () {
        if (y(C).object) {
          y('nplayer-install-msg').innerHTML = '';
          window.clearInterval(M);
          window.setTimeout(function () {
            e = new _NPlayerPlugin(y(C));
            if (E.visible != false) {
              e.setVisible(true);
            }
            w();
          }, 100);
        }
      }, 500);
    }
  }

  function m () {
    try {
      var M = navigator.plugins['nPlayer plugin'];
      if (!M) {
        return false;
      }
      if (c(M.description, NPLAYER_VERSION) < 0) {
        return false;
      }
      return true;
    } catch (N) {
      return false;
    }
  }

  function z () {
    y(A).innerHTML = v();
    setInterval(function () {
      navigator.plugins.refresh();
      if (m()) {
        location.reload();
      }
    }, 1000);
  }

  function g () {
    if (m()) {
      var M = B() + '<object style=\'visibility:hidden;\' id=\'' + C + '\' width=\'100%\' height=\'100%\' type=\'application/x-nplayer\'><param name=\'ControlBoxUrl\' value=\'' + E.controlBox + '\' /><param name=\'GuardDataBaseUrl\' value=\'' + NPLAYER_GUARD_DB_URL + '\' />' + (E.auth ? '<param name=\'AuthUrl\' value=\'' + E.auth + '\' />' : '') + '<param name=\'AutoPlay\' value=\'' + (E.autoplay == false ? 'false' : 'true') + '\' /><param name=\'Seekable\' value=\'' + (E.seekable == false ? 'false' : 'true') + '\' /></object>';
      y(A).innerHTML += M;
      e = new _NPlayerPlugin(y(C));
      if (E.visible != false) {
        e.setVisible(true);
      }
      w();
    } else {
      z();
    }
  }

  function u () {
    var M = B() + '<video class=\'video-js vjs-default-skin\' style=\'visibility:hidden\' id=\'' + C + '\' width=\'100%\' height=\'100%\' preload ondblclick=\'player.setFullscreen(!player.getFullscreen());\'></video>';
    y(A).innerHTML += M;
    e = new _NPlayerHtml5(y(C), E);
    if (E.visible != false) {
      e.setVisible(true);
    }
    w();
  }

  function w () {
    e.attachEvent('OpenStateChanged', function (N) {
      switch (N) {
      case NPlayer.OpenState.Opening:
        G();
        break;
      case NPlayer.OpenState.Opened:
        t = 0;
        o = 0;
        f = 0;
        s = 0;
        if (!x) {
            try {
              i.setCurrentPlaybackTime(F);
            } catch (O) {}
          }
        break;
      }
      if (i._onOpenStateChanged) {
        for (var M in i._onOpenStateChanged) {
          i._onOpenStateChanged[M](N);
        }
      }
    });
    e.attachEvent('PlayStateChanged', function (N) {
      switch (N) {
      case NPlayer.PlayState.Playing:
        break;
      case NPlayer.PlayState.Paused:
        break;
      case NPlayer.PlayState.Stopped:
        I = j;
        break;
      }
      if (i._onPlayStateChanged) {
        for (var M in i._onPlayStateChanged) {
          i._onPlayStateChanged[M](N);
        }
      }
    });
    e.attachEvent('BufferingData', function (N) {
      if (i._onBufferingData) {
        for (var M in i._onBufferingData) {
          i._onBufferingData[M](N);
        }
      }
    });
    e.attachEvent('PlaybackCompleted', function () {
      if (j > 0 && --I <= 0) {
        e.stop();
      }
      if (i._onPlaybackCompleted) {
        for (var M in i._onPlaybackCompleted) {
          i._onPlaybackCompleted[M]();
        }
      }
    });
    e.attachEvent('Error', function (M, O) {
      d(O);
      if (i._onError) {
        for (var N in i._onError) {
          i._onError[N](M, O);
        }
      }
    });
    e.attachEvent('RateChanged', function (N) {
      if (i._onRateChanged) {
        for (var M in i._onRateChanged) {
          i._onRateChanged[M](N);
        }
      }
    });
    e.attachEvent('VolumeChanged', function (N) {
      if (i._onVolumeChanged) {
        for (var M in i._onVolumeChanged) {
          i._onVolumeChanged[M](N);
        }
      }
    });
    e.attachEvent('MuteChanged', function (N) {
      if (i._onMuteChanged) {
        for (var M in i._onMuteChanged) {
          i._onMuteChanged[M](N);
        }
      }
    });
    e.attachEvent('RepeatPointAChanged', function (M) {
      if (i._onRepeatPointAChanged) {
        for (var N in i._onRepeatPointAChanged) {
          i._onRepeatPointAChanged[N](M);
        }
      }
    });
    e.attachEvent('RepeatPointBChanged', function (M) {
      if (i._onRepeatPointBChanged) {
        for (var N in i._onRepeatPointBChanged) {
          i._onRepeatPointBChanged[N](M);
        }
      }
    });
    e.attachEvent('PlaybackRangeChanged', function (O, M) {
      if (i._onPlaybackRangeChanged) {
        for (var N in i._onPlaybackRangeChanged) {
          i._onPlaybackRangeChanged[N](O, M);
        }
      }
    });
    e.attachEvent('UpdateTime', function (O) {
      var P = parseInt(O);
      if (t == P) {
        return;
      }
      if (e.getPlayState() == NPlayer.PlayState.Playing) {
        var O = parseInt(e.getCurrentPlaybackTime());
        if (O != s) {
          var N = (s + 1 == O);
          o += N;
          f += N / e.getCurrentPlaybackRate();
          s = O;
        }
      }
      t = P;
      if (i._onUpdateTime) {
        for (var M in i._onUpdateTime) {
          i._onUpdateTime[M](t);
        }
      }
    });
    e.attachEvent('Click', function (M, P) {
      if (i._onClick) {
        var O = true;
        for (var N in i._onClick) {
          if (i._onClick[N](M, P) == false) {
            O = false;
          }
        }
        if (O) {
          a(M, P);
        }
      } else {
        a(M, P);
      }
    });
    e.attachEvent('DblClick', function (M, P) {
      if (i._onDblClick) {
        var O = true;
        for (var N in i._onDblClick) {
          if (i._onDblClick[N](M, P) == false) {
            O = false;
          }
        }
        if (O) {
          a(M, P);
        }
      } else {
        H(M, P);
      }
    });
    e.attachEvent('KeyDown', function (M) {
      if (navigator.userAgent.search('MSIE 7.0') != -1 && document.documentMode > 7) {
        return;
      }
      if (!A) {
        return;
      }
      if (i._onKeyDown) {
        var O = true;
        for (var N in i._onKeyDown) {
          if (i._onKeyDown[N](M) == false) {
            O = false;
          }
        }
        if (O) {
          k(M);
        }
      } else {
        k(M);
      }
    });
    e.attachEvent('GetControlBoxHeight', function () {
      if (i.onGetControlBoxHeight) {
        return i.onGetControlBoxHeight();
      }
      return 0;
    });
    e.attachEvent('GuardCallback', function (M, O) {
      if (i._onGuardCallback) {
        for (var N in i._onGuardCallback) {
          i._onGuardCallback[N](M, O);
        }
      }
    });
    e.attachEvent('ContextMenu', function (M, O) {
      if (i._onContextMenu) {
        for (var N in i._onContextMenu) {
          i._onContextMenu[N](M, O);
        }
      }
    });
    e.attachEvent('FrameStepChanged', function (N) {
      if (i._onFrameStepChanged) {
        for (var M in i._onFrameStepChanged) {
          i._onFrameStepChanged[M](N);
        }
      }
    });
    window.setTimeout(function () {
      if (i._onReady) {
        for (var M in i._onReady) {
          i._onReady[M]();
        }
      }
    }, 0);
  }

  function a () {
    if (!A) {
      return;
    }
  }

  function H () {
    if (!A) {
      return;
    }
    l();
  }

  function k (M) {
    switch (M) {
    case 13:
      l();
      break;
    case 27:
      e.setFullscreen(false);
      break;
    case 32:
      h();
      break;
    case 38:
      e.setVolume(e.getVolume() + 0.1);
      break;
    case 40:
      e.setVolume(e.getVolume() - 0.1);
      break;
    case 37:
      i.setCurrentPlaybackTime(e.getCurrentPlaybackTime() - i.getFrameStep());
      break;
    case 39:
      i.setCurrentPlaybackTime(e.getCurrentPlaybackTime() + i.getFrameStep());
      break;
    case 90:
    case 122:
      i.setCurrentPlaybackRate(1);
      break;
    case 88:
    case 120:
      if (e.getCurrentPlaybackRate().toFixed(1) > 0.6) {
          i.setCurrentPlaybackRate(e.getCurrentPlaybackRate() - 0.1);
        }
      break;
    case 67:
    case 99:
      if (e.getCurrentPlaybackRate().toFixed(1) < 2) {
          i.setCurrentPlaybackRate(e.getCurrentPlaybackRate() + 0.1);
        }
      break;
    case 219:
      e.setRepeatPointA(e.getCurrentPlaybackTime());
      break;
    case 221:
      e.setRepeatPointB(e.getCurrentPlaybackTime());
      break;
    case 220:
      i.resetABRepeat();
      break;
    case 77:
    case 109:
      J();
      break;
    default:
      return true;
    }
    return false;
  }

  function h () {
    if (e.getPlayState() == NPlayer.PlayState.Playing) {
      e.pause();
    } else {
      e.play();
    }
  }

  function l () {
    e.setFullscreen(!e.getFullscreen());
  }

  function J () {
    e.setMute(!e.getMute());
  }

  function d (N) {
    D = e.getVisible();
    e.setVisible(false);
    try {
      y(C + '-msg').innerHTML = '<table width=\'100%\' height=\'100%\' style=\'color:#ff0000;font-size:14px;position:absolute;\'><tr><td align=\'center\' valign=\'middle\'><div id=\'nplayer-error-image\'></div>' + N + '</td></tr></table>';
    } catch (M) {}
  }

  function G (N) {
    e.setVisible(D);
    try {
      y(C + '-msg').innerHTML = '';
    } catch (M) {}
  }
  this.open = function (N, O) {
    if (O) {
      F = O;
    }
    var M = typeof (N);
    if (M == 'string') {
      e.open(N);
    } else {
      if (M == 'object') {
        e.setPlayItem(N);
      }
    }
  };
  this.close = function () {
    e.close();
  };
  this.play = function () {
    e.play();
  };
  this.pause = function () {
    e.pause();
  };
  this.stop = function () {
    e.stop();
  };
  this.command = function (M, N) {
    e.command(M, N);
  };
  this.setCDNAuthParam = function (M) {
    e.setCDNAuthParam(M);
  };
  this.setPlayItem = function (M) {
    e.setPlayItem(M);
  };
  this.setSubtitleFont = function (M, N) {
    e.setSubtitleFont(M, N);
  };
  this.setSubtitleColor = function (P, O, M, N) {
    e.setSubtitleColor(P, O, M, N);
  };
  this.setSubtitlePosition = function (M, N) {
    e.setSubtitlePosition(M, N);
  };
  this.setSubtitleText = function (M) {
    e.setSubtitleText(M);
  };
  this.setWatermarkText = function (M) {
    e.setWatermarkText(M);
  };
  this.setWatermarkSize = function (M) {
    e.setWatermarkSize(M);
  };
  this.setWatermarkColor = function (P, O, M, N) {
    e.setWatermarkColor(P, O, M, N);
  };
  this.setWatermarkLocation = function (M) {
    e.setWatermarkLocation(M);
  };
  this.setWatermarkInterval = function (M) {
    e.setWatermarkInterval(M);
  };
  this.setWatermarkDuration = function (M) {
    e.setWatermarkDuration(M);
  };
  this.getSeekable = function () {
    return e.getSeekable();
  };
  this.setSeekable = function (M) {
    e.setSeekable(M);
  };
  this.getBrightness = function () {
    return e.getBrightness();
  };
  this.setBrightness = function (M) {
    e.setBrightness(M);
  };
  this.getContrast = function () {
    return e.getContrast();
  };
  this.setContrast = function (M) {
    e.setContrast(M);
  };
  this.getSaturation = function () {
    return e.getSaturation();
  };
  this.setSaturation = function (M) {
    e.setSaturation(M);
  };
  this.bindEvent = function (M, N) {
    var O = '_on' + M;
    if (!i[O]) {
      i[O] = [];
    }
    i[O].push(N);
  };
  this.getOpenState = function () {
    return e.getOpenState();
  };
  this.getPlayState = function () {
    return e.getPlayState();
  };
  this.getDuration = function () {
    return e.getDuration();
  };
  this.getCurrentPlaybackTime = function () {
    return e.getCurrentPlaybackTime();
  };
  this.setCurrentPlaybackTime = function (N) {
    t = 0;
    if (i._onPlaybackPositionChanging) {
      for (var M in i._onPlaybackPositionChanging) {
        i._onPlaybackPositionChanging[M](N);
      }
    }
    e.setCurrentPlaybackTime(N);
  };
  this.getCurrentPlaybackRate = function () {
    return e.getCurrentPlaybackRate();
  };
  this.setCurrentPlaybackRate = function (M) {
    e.setCurrentPlaybackRate(M);
  };
  this.getNearestKeyframeTimestamp = function (M) {
    return e.getNearestKeyframeTimestamp(M);
  };
  this.setPlaybackRange = function (N, M) {
    e.setPlaybackRange(N, M);
  };
  this.addContextMenu = function (N, M) {
    e.addContextMenu(N, M);
  };
  this.getVolume = function () {
    return e.getVolume();
  };
  this.setVolume = function (M) {
    e.setVolume(M);
  };
  this.getMute = function () {
    return e.getMute();
  };
  this.setMute = function (M) {
    e.setMute(M);
  };
  this.getFullscreen = function () {
    return e.getFullscreen();
  };
  this.setFullscreen = function (M) {
    e.setFullscreen(M);
  };
  this.getABRepeat = function () {
    return e.getRepeatPointA() >= 0 && e.getRepeatPointB() >= 0;
  };
  this.setABRepeat = function (M) {
    if (M) {
      i.setRepeatPointA(0);
      i.setRepeatPointB(e.getDuration());
    } else {
      i.resetRepeatPointA();
      i.resetRepeatPointB();
    }
  };
  this.resetABRepeat = function () {
    i.setABRepeat(false);
  };
  this.getRepeatPointA = function () {
    return e.getRepeatPointA();
  };
  this.setRepeatPointA = function (M) {
    if (M > e.getDuration()) {
      return;
    }
    e.setRepeatPointA(M);
  };
  this.resetRepeatPointA = function () {
    e.resetRepeatPointA();
  };
  this.getRepeatPointB = function () {
    return e.getRepeatPointB();
  };
  this.setRepeatPointB = function (M) {
    if (M > e.getDuration()) {
      return;
    }
    e.setRepeatPointB(M);
  };
  this.resetRepeatPointB = function () {
    e.resetRepeatPointB();
  };
  this.getRepeatCount = function () {
    return j;
  };
  this.setRepeatCount = function (M) {
    I = j = M;
  };
  this.getBeginPlaybackPosition = function () {
    return e.getBeginPlaybackPosition();
  };
  this.getEndPlaybackPosition = function () {
    return e.getEndPlaybackPosition();
  };
  this.getVisible = function () {
    return e.getVisible();
  };
  this.setVisible = function (M) {
    e.setVisible(M);
  };
  this.getRealPlayTime = function () {
    return o;
  };
  this.getPlayTime = function () {
    return f;
  };
  this.getFrameStep = function () {
    return e.getFrameStep();
  };
  this.setFrameStep = function (M) {
    e.setFrameStep(M);
  };
  this.isControlBox = function () {
    return x;
  };
  this.getDeviceID = function () {
    return e.getDeviceID();
  };
}
NPlayer.OpenState = function () {};
NPlayer.OpenState.Opening = 0;
NPlayer.OpenState.Opened = 1;
NPlayer.OpenState.Closing = 2;
NPlayer.OpenState.Closed = 3;
NPlayer.PlayState = function () {};
NPlayer.PlayState.Playing = 0;
NPlayer.PlayState.Paused = 1;
NPlayer.PlayState.Stopped = 2;
