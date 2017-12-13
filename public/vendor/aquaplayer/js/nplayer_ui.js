
function initNPlayerUI (x) {
  var A = false;
  var v = false;
  jQuery('.wrapper_foot a').click(function (D) {
    D.preventDefault();
  });
  jQuery('.wrapper_foot').each(function () {
    this.onselectstart = function () {
      return false;
    };
    this.unselectable = 'on';
    jQuery(this).css('user-select', 'none');
    jQuery(this).css('-o-user-select', 'none');
    jQuery(this).css('-moz-user-select', 'none');
    jQuery(this).css('-khtml-user-select', 'none');
    jQuery(this).css('-webkit-user-select', 'none');
  });
  jQuery('.np_btn_play').click(j);
  jQuery('.btn_sound').click(w);
  jQuery('.btn_soundMute').click(w);
  jQuery('.btn_fullScr').click(C);
  jQuery('.btn_normalScr').click(C);
  jQuery('.btn_repeat').click(u);
  jQuery('.btn_seekPrev').click(k);
  jQuery('.btn_seekNext').click(l);
  jQuery('.btn_s06').click(function () {
    i(0.6);
  });
  jQuery('.btn_s07').click(function () {
    i(0.7);
  });
  jQuery('.btn_s08').click(function () {
    i(0.8);
  });
  jQuery('.btn_s09').click(function () {
    i(0.9);
  });
  jQuery('.btn_s10').click(function () {
    i(1);
  });
  jQuery('.btn_s11').click(function () {
    i(1.1);
  });
  jQuery('.btn_s12').click(function () {
    i(1.2);
  });
  jQuery('.btn_s13').click(function () {
    i(1.3);
  });
  jQuery('.btn_s14').click(function () {
    i(1.4);
  });
  jQuery('.btn_s15').click(function () {
    i(1.5);
  });
  jQuery('.btn_s16').click(function () {
    i(1.6);
  });
  jQuery('.btn_s17').click(function () {
    i(1.7);
  });
  jQuery('.btn_s18').click(function () {
    i(1.8);
  });
  jQuery('.btn_s19').click(function () {
    i(1.9);
  });
  jQuery('.btn_s20').click(function () {
    i(2);
  });
  jQuery('.btn_s06_dot').click(function () {
    i(0.6);
  });
  jQuery('.btn_s07_dot').click(function () {
    i(0.7);
  });
  jQuery('.btn_s08_dot').click(function () {
    i(0.8);
  });
  jQuery('.btn_s09_dot').click(function () {
    i(0.9);
  });
  jQuery('.btn_s10_dot').click(function () {
    i(1);
  });
  jQuery('.btn_s11_dot').click(function () {
    i(1.1);
  });
  jQuery('.btn_s12_dot').click(function () {
    i(1.2);
  });
  jQuery('.btn_s13_dot').click(function () {
    i(1.3);
  });
  jQuery('.btn_s14_dot').click(function () {
    i(1.4);
  });
  jQuery('.btn_s15_dot').click(function () {
    i(1.5);
  });
  jQuery('.btn_s16_dot').click(function () {
    i(1.6);
  });
  jQuery('.btn_s17_dot').click(function () {
    i(1.7);
  });
  jQuery('.btn_s18_dot').click(function () {
    i(1.8);
  });
  jQuery('.btn_s19_dot').click(function () {
    i(1.9);
  });
  jQuery('.btn_s20_dot').click(function () {
    i(2);
  });
  jQuery(document).bind('webkitfullscreenchange', npExitHandler);
  jQuery('.input_setSeekTime').blur(function () {
    x.setFrameStep(parseInt(jQuery(this).val()));
  });

  function m (D) {
    return D.originalEvent.changedTouches ? D.originalEvent.changedTouches[0].pageX : D.pageX;
  }
  jQuery('.track_back').bind('mousedown touchstart', function (G) {
    var H = jQuery(this);

    function E (J) {
      var I = m(J) - H.offset().left;
      var K = (I / H.width()) * x.getDuration();
      if (K < 0) {
        K = 0;
      } else {
        if (K > x.getDuration()) {
          K = x.getDuration();
        }
      }
      return K;
    }

    function F (I) {
      r(E(I));
      I.preventDefault();
    }

    function D (I) {
      A = false;
      x.setCurrentPlaybackTime(x.getNearestKeyframeTimestamp(E(I)));
      jQuery(document).unbind('mousemove touchmove', F);
      jQuery(document).unbind('mouseup touchend', D);
    }
    A = true;
    r(E(G));
    jQuery(document).bind('mouseup touchend', D);
    jQuery(document).bind('mousemove touchmove', F);
    G.preventDefault();
  });
  jQuery('.track_repeatBtnA').bind('mousedown touchstart', function (G) {
    var H = jQuery(this).parent();

    function E (K) {
      var J = m(K) - H.offset().left;
      var L = (J / H.width()) * x.getDuration();
      if (L < 0) {
        L = 0;
      } else {
        if (L > x.getRepeatPointB()) {
          L = x.getRepeatPointB();
        }
      }
      return L;
    }

    function I (L) {
      var J = (L / x.getDuration()) * 100 + '%';
      var K = ((x.getRepeatPointB() - L) / x.getDuration() * 100) + '%';
      jQuery('.track_repeatBtnA').css('left', J);
      jQuery('.track_repeat').css('left', J).css('width', K);
      jQuery('#text_currentTime').text(B(L));
    }

    function F (J) {
      I(E(J));
      J.preventDefault();
    }

    function D (J) {
      v = false;
      x.setRepeatPointA(E(J));
      jQuery(document).unbind('mousemove touchmove', F);
      jQuery(document).unbind('mouseup touchend', D);
    }
    v = true;
    I(E(G));
    jQuery(document).bind('mouseup touchend', D);
    jQuery(document).bind('mousemove touchmove', F);
    G.preventDefault();
    G.stopPropagation();
  });
  jQuery('.track_repeatBtnB').bind('mousedown touchstart', function (G) {
    var H = jQuery(this).parent();

    function E (K) {
      var J = m(K) - H.offset().left;
      var L = (J / H.width()) * x.getDuration();
      if (L < x.getRepeatPointA()) {
        L = x.getRepeatPointA();
      } else {
        if (L > x.getDuration()) {
          L = x.getDuration();
        }
      }
      return L;
    }

    function I (K) {
      var L = (K / x.getDuration()) * 100 + '%';
      var J = ((K - x.getRepeatPointA()) / x.getDuration() * 100) + '%';
      jQuery('.track_repeatBtnB').css('left', L);
      jQuery('.track_repeat').css('width', J);
      jQuery('#text_currentTime').text(B(K));
    }

    function F (J) {
      I(E(J));
      J.preventDefault();
    }

    function D (J) {
      v = false;
      x.setRepeatPointB(E(J));
      jQuery(document).unbind('mousemove touchmove', F);
      jQuery(document).unbind('mouseup touchend', D);
    }
    v = true;
    I(E(G));
    jQuery(document).bind('mouseup touchend', D);
    jQuery(document).bind('mousemove touchmove', F);
    G.preventDefault();
    G.stopPropagation();
  });
  jQuery('.sound_track_back').bind('mousedown touchstart', function (G) {
    var H = jQuery(this);

    function F (K) {
      var I = m(K) - H.offset().left;
      var J = I / H.width();
      if (J < 0) {
        J = 0;
      } else {
        if (J > 1) {
          J = 1;
        }
      }
      return J;
    }

    function E (I) {
      x.setVolume(F(I));
      I.preventDefault();
    }

    function D (I) {
      x.setVolume(F(I));
      jQuery(document).unbind('mousemove touchmove', E);
      jQuery(document).unbind('mouseup touchend', D);
    }
    x.setVolume(F(G));
    jQuery(document).bind('mouseup touchend', D);
    jQuery(document).bind('mousemove touchmove', E);
    G.preventDefault();
  });
  x.bindEvent('OpenStateChanged', z);
  x.bindEvent('PlayStateChanged', q);
  x.bindEvent('BufferingData', s);
  x.bindEvent('RateChanged', g);
  x.bindEvent('VolumeChanged', f);
  x.bindEvent('MuteChanged', n);
  x.bindEvent('RepeatPointAChanged', p);
  x.bindEvent('RepeatPointBChanged', p);
  x.bindEvent('PlaybackRangeChanged', a);
  x.bindEvent('FrameStepChanged', b);
  x.bindEvent('UpdateTime', function (D) {
    if (!A) {
      r(D);
    }
  });
  x.onGetControlBoxHeight = function () {
    return parseInt(jQuery('.wrapper_foot').height());
  };
  f(x.getVolume());
  n(x.getMute());
  g(x.getCurrentPlaybackRate());
  e(x.getDuration());

  function j () {
    if (x.getPlayState() == NPlayer.PlayState.Playing) {
      x.pause();
    } else {
      x.play();
    }
  }

  function w () {
    x.setMute(!x.getMute());
  }

  function C () {
    x.setFullscreen(!x.getFullscreen());
  }

  function u () {
    x.setABRepeat(!x.getABRepeat());
  }

  function k () {
    x.setFrameStep(parseInt(jQuery('.input_setSeekTime').val()));
    x.setCurrentPlaybackTime(x.getCurrentPlaybackTime() - x.getFrameStep());
  }

  function l () {
    x.setFrameStep(parseInt(jQuery('.input_setSeekTime').val()));
    x.setCurrentPlaybackTime(x.getCurrentPlaybackTime() + x.getFrameStep());
  }

  function i (D) {
    x.setCurrentPlaybackRate(D);
  }

  function d (D) {
    jQuery('.control_text_status').text(D);
  }
  var h = jQuery('.track_seekBtn').get(0);
  var o = jQuery('.track_current').get(0);
  var t = jQuery('#text_currentTime');

  function r (E) {
    if (E < 0) {
      return;
    }
    var D = x.getDuration();
    var F = (D > 0 ? (E / D) * 100 : 0) + '%';
    h.style.left = F;
    o.style.width = F;
    if (!v) {
      t.text(B(E));
    }
  }

  function e (D) {
    jQuery('#text_duration').text(B(D));
  }

  function z (D) {
    switch (D) {
    case NPlayer.OpenState.Opened:
      f(x.getVolume());
      n(x.getMute());
      g(x.getCurrentPlaybackRate());
      e(x.getDuration());
      if (!x.isControlBox()) {
        x.setFrameStep(Number(jQuery('.input_setSeekTime').val()));
      }
      break;
    case NPlayer.OpenState.Closed:
      r(0);
      e(0);
      break;
    }
    d(c(D));
  }

  function q (D) {
    switch (D) {
    case NPlayer.PlayState.Playing:
      jQuery('.control_play > .np_btn_play').removeClass('np_btn_play').addClass('btn_pause');
      break;
    case NPlayer.PlayState.Paused:
      jQuery('.control_play > .btn_pause').removeClass('btn_pause').addClass('np_btn_play');
      break;
    case NPlayer.PlayState.Stopped:
      jQuery('.control_play > .btn_pause').removeClass('btn_pause').addClass('np_btn_play');
      r(x.getBeginPlaybackPosition() >= 0 ? x.getBeginPlaybackPosition() : 0);
      break;
    }
    d(y(D));
  }

  function s (D) {
    if (D) {
      d('Buffering');
    } else {
      d(y(x.getPlayState()));
    }
  }

  function g (F) {
    for (var E = 0.5; E <= 2.1; E += 0.1) {
      var D = E.toFixed(1).replace('.', '');
      jQuery('.btn_s' + D + '_cur').removeClass('btn_s' + D + '_cur').addClass('btn_s' + D);
      jQuery('.btn_s' + D + '_dot_cur').removeClass('btn_s' + D + '_dot_cur').addClass('btn_s' + D + '_dot');
    }
    var D = F.toFixed(1).replace('.', '');
    jQuery('.btn_s' + D).removeClass('btn_s' + D).addClass('btn_s' + D + '_cur');
    jQuery('.btn_s' + D + '_dot').removeClass('btn_s' + D + '_dot').addClass('btn_s' + D + '_dot_cur');
  }

  function f (D) {
    if (D <= 0) {
      jQuery('.sound_btn > .btn_sound').removeClass('btn_sound').addClass('btn_soundMute');
    } else {
      jQuery('.sound_btn > .btn_soundMute').removeClass('btn_soundMute').addClass('btn_sound');
    }
    jQuery('.sound_track_cur').css('width', D * 100 + '%');
  }

  function n (D) {
    if (x.getVolume() <= 0) {
      D = true;
    }
    if (D) {
      jQuery('.sound_btn > .btn_sound').removeClass('btn_sound').addClass('btn_soundMute');
      jQuery('.sound_track_cur').css('width', '0%');
    } else {
      jQuery('.sound_btn > .btn_soundMute').removeClass('btn_soundMute').addClass('btn_sound');
      jQuery('.sound_track_cur').css('width', x.getVolume() * 100 + '%');
    }
  }

  function p (E) {
    if (x.getABRepeat()) {
      jQuery('.control_repeat > .btn_repeat').removeClass('btn_repeat').addClass('btn_repeatHover');
      var D = (x.getRepeatPointA() / x.getDuration() * 100) + '%';
      var G = (x.getRepeatPointB() / x.getDuration() * 100) + '%';
      var F = ((x.getRepeatPointB() - x.getRepeatPointA()) / x.getDuration() * 100) + '%';
      jQuery('.track_repeatBtnA').css('left', D).show();
      jQuery('.track_repeatBtnB').css('left', G).show();
      jQuery('.track_repeat').css('left', D).css('width', F).show();
    } else {
      jQuery('.control_repeat > .btn_repeatHover').removeClass('btn_repeatHover').addClass('btn_repeat');
      jQuery('.track_repeatBtnA').hide();
      jQuery('.track_repeatBtnB').hide();
      jQuery('.track_repeat').hide();
    }
  }

  function a (F, D) {
    if (F >= 0 && D >= 0) {
      var G = (F / x.getDuration() * 100) + '%';
      var E = ((D - F) / x.getDuration() * 100) + '%';
      jQuery('.track_range').css('left', G).css('width', E).show();
    } else {
      jQuery('.track_range').hide();
    }
  }

  function b (D) {
    jQuery('.input_setSeekTime').val(D);
  }

  function c (D) {
    switch (D) {
    case NPlayer.OpenState.Opening:
      return 'Opening';
    case NPlayer.OpenState.Opened:
      return 'Opened';
    case NPlayer.OpenState.Closing:
      return 'Closing';
    case NPlayer.OpenState.Closed:
      return 'Closed';
    }
  }

  function y (D) {
    switch (D) {
    case NPlayer.PlayState.Playing:
      return 'Playing';
    case NPlayer.PlayState.Paused:
      return 'Paused';
    case NPlayer.PlayState.Stopped:
      return 'Stopped';
    }
  }

  function B (H) {
    if (!H) {
      H = 0;
    }
    var F = parseInt(H) % 60;
    var D = parseInt(H / 60) % 60;
    var E = parseInt(H / 60 / 60);

    function G (I) {
      if (I < 10) {
        return '0' + I;
      } else {
        return I;
      }
    }
    return [G(E), G(D), G(F)].join(':');
  }
}

function nplayerOnFullscreen () {
  $('.wrapper_foot').delay(3000).animate({
    opacity: '0'
  }, 10);
  $('.wrapper_foot').bind('mouseenter', function () {
    $(this).stop(true, true).css('opacity', '1');
  }).bind('mouseleave', function () {
    $(this).delay(3000).animate({
      opacity: '0'
    }, 10);
  });
  $('a.btn_fullScr').removeClass('btn_fullScr').addClass('btn_normalScr');
  $('body').addClass('nplayer-fullscreen');
  hideContextMenu();
}

function nplayerExitFullscreen () {
  $('.wrapper_foot').stop(true, true).css('opacity', '1');
  $('.wrapper_foot').unbind('mouseenter').unbind('mouseleave');
  $('a.btn_normalScr').removeClass('btn_normalScr').addClass('btn_fullScr');
  $('body').removeClass('nplayer-fullscreen');
  hideContextMenu();
}
jQuery(document).bind('contextmenu', function (a) {
  a.preventDefault();
});
jQuery(document).bind('click', function (a) {
  if (a.which == 3) {
    return;
  }
  hideContextMenu();
});
jQuery(document).bind('webkitfullscreenchange', function () {
  if (document.webkitIsFullScreen) {
    nplayerOnFullscreen();
  } else {
    nplayerExitFullscreen();
  }
});
jQuery(document).bind('mozfullscreenchange', function () {
  if (document.mozFullScreen) {
    nplayerOnFullscreen();
  } else {
    nplayerExitFullscreen();
  }
});
jQuery(document).bind('MSFullscreenChange', function () {
  if (document.msFullscreenElement) {
    nplayerOnFullscreen();
  } else {
    nplayerExitFullscreen();
  }
});

function npExitHandler () {
  var a = /constructor/i.test(window.HTMLElement) || (function (b) {
    return b.toString() === '[object SafariRemoteNotification]';
  })(!window.safari || safari.pushNotification);
  if (document.webkitIsFullScreen && a) {
    $('.input_setSeekTime').css({
      'pointer-events': 'none',
      opacity: '0.7'
    });
  } else {
    $('.input_setSeekTime').css({
      'pointer-events': '',
      opacity: ''
    });
  }
}

function showContextMenu (c) {
  if (!player) {
    return;
  }
  if (!g__init_contextmenu) {
    initContextMenu(c);
  }
  $('.np-menuitem').removeClass('show');
  if (player.getPlayState() == NPlayer.PlayState.Paused) {
    $('.np-menuitem-btnplay').addClass('show');
  } else {
    if (player.getPlayState() == NPlayer.PlayState.Playing) {
      $('.np-menuitem-btnpause').addClass('show');
    }
  }
  if (player.getFullscreen()) {
    $('.np-menuitem-btnnormalscreen').addClass('show');
  } else {
    $('.np-menuitem-btnfullscreen').addClass('show');
  }
  if (document.getElementsByTagName('video').length > 0 && document.getElementsByTagName('video')[0].textTracks.length > 0) {
    if (document.getElementsByTagName('video')[0].textTracks[0].mode == 'hidden') {
      $('.np-menuitem-subtitle-show').addClass('show');
    } else {
      if (document.getElementsByTagName('video')[0].textTracks[0].mode == 'showing') {
        $('.np-menuitem-subtitle-hide').addClass('show');
      }
    }
  }
  $('.np-menuitem.np-menuitem-custom').addClass('show');
  $('.np-vheight').height($('.np-menuitem.show').length * 32 + 16);
  var b = c.pageY + 5;
  var a = c.pageX;
  $('.np-contextmenu[data-enable=\'true\']').css({
    top: b + 'px',
    left: a + 'px'
  }).fadeIn(80);
  return false;
}

function hideContextMenu () {
  $('.np-contextmenu').hide();
}

function showTrack () {
  document.getElementsByTagName('video')[0].textTracks[0].mode = 'showing';
}

function hideTrack () {
  document.getElementsByTagName('video')[0].textTracks[0].mode = 'hidden';
}
var g__init_contextmenu = false;

function initContextMenu (a) {
  g__init_contextmenu = true;
  $('.np-menuitem').bind('click', function () {
    hideContextMenu();
  });
  $('.np-menuitem-btnplay').bind('click', function () {
    player.play();
  });
  $('.np-menuitem-btnpause').bind('click', function () {
    player.pause();
  });
  $('.np-menuitem-btnfullscreen').bind('click', function () {
    player.setFullscreen(true);
  });
  $('.np-menuitem-btnnormalscreen').bind('click', function () {
    player.setFullscreen(false);
  });
  $('.np-menuitem-subtitle-show').bind('click', function () {
    showTrack();
  });
  $('.np-menuitem-subtitle-hide').bind('click', function () {
    hideTrack();
  });
}
var g__fullscreen_layout_id__ = 'maincontent';
