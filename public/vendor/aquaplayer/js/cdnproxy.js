// HTML5를 위한 함수 추가 사항
var statehttp;
var videoStartFlag;
var stopstatehttp;
var proxyHealthchecked;
var proxyHealthhttp;
var proxyverhttp;
var callerrorhttp;
var exithttp;
var newinPlayer;
var media_auth;
var mdia_url;
var gentAuthhttp;
var proxy_http_host = 'http://cdnplayer.cdnetworks.com:8282';
var proxy_https_host = 'https://cdnplayer.cdnetworks.com:8283';
var proxy_state_host = 'http://cdnplayer.cdnetworks.com:8284';
var dupProxycallback;
var dupPlayercallback;
var isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
var setup_url;
var proxy_ver;
if (isMac) {
  setup_url = NPLAYER_OSX_SETUP_URL;
  proxy_ver = PROXY_OSX_VERSION;
} else {
  setup_url = NPLAYER_SETUP_URL;
  proxy_ver = PROXY_WIN_VERSION;
}

function setSecurePage (isHttpsPage) {
  if (isHttpsPage == true) {
      proxy_state_host = 'https://cdnplayer.cdnetworks.com:8285';
    } else {
      proxy_state_host = 'http://cdnplayer.cdnetworks.com:8284';
    }
}

function setNPlayer (objplayer) {
  newinPlayer = objplayer;
}

function setPlayerStart (start_state) {
  videoStartFlag = start_state;
}

function setMediaInfo (content_url, content_auth) {
  media_auth = content_auth;
  mdia_url = encodeURIComponent(content_url);
}

function setdupcallback (callback) {
  dupProxycallback = callback;
}

function setduplicatePlayCallback (callback) {
  dupPlayercallback = callback;
}

function getMediaURL (isSecure) {
  var mediafullurl = '';
  if (isSecure == true) {
      mediafullurl = proxy_https_host + '/cddr_streaming?url=' + mdia_url + '&param=' + media_auth;
    } else {
      mediafullurl = proxy_http_host + '/cddr_streaming?url=' + mdia_url + '&param=' + media_auth;
    }
  return mediafullurl;
}

function exitFunction () {
  authdelete();
}

function setpageunloaccallback () {
  var binfo = get_browser();
  if (binfo.name === 'IE' || binfo.name === 'msie' || binfo.name === 'safari' || binfo.name === 'chrome' || binfo.name === 'trident') {
        // alert("Browser IE or Chrome or Safari");
      if (document.addEventListener) {
          document.addEventListener('pagehide', exitFunction, false);
          document.addEventListener('unload', exitFunction, false);
        } else if (window.addEventListener) {
          document.addEventListener('pagehide', exitFunction);
          document.addEventListener('unload', exitFunction);
        }
    } else if (binfo.name === 'firefox') {
        // alert("Browser FireFox");
      window.addEventListener('beforeunload', function (e) {
          console.log('Player 종료합니다.');
          var confirmationMessage = 'Player 종료합니다.';
          authdelete();
            //  (e || window.event).returnValue = confirmationMessage;     //Gecko + IE
          e.defaultPrevenred = true;
          return confirmationMessage; // Webkit, Safari, Chrome etc.
        });
    }
}

function getNewinPlayerDuration () {
  var duration = newinPlayer.getDuration();
  return (parseInt(duration * 1000));
}

function getNewinPlaybackRate () {
  var playbackrate = newinPlayer.getCurrentPlaybackRate();
  return (parseInt(playbackrate * 1000));
}

function getNewinCurrentPosition () {
  var pos = newinPlayer.getCurrentPlaybackTime();
  return (parseInt(pos * 1000));
}

function createXMLHttpRequest () {
  return new XMLHttpRequest();
}

function starthtml5State () {
  var state = newinPlayer.getOpenState();
  switch (state) {
    case NPlayer.OpenState.Opened:
      {
              statehttp = createXMLHttpRequest();
              var url = proxy_state_host + '/mediastate?mediaKey=' + media_auth + '&current=' + getNewinCurrentPosition();
              url += '&playbackrate=' + getNewinPlaybackRate() + '&duration=' + getNewinPlayerDuration() + '&playstate=' + newinPlayer.getPlayState() + '&openstate=' + newinPlayer.getOpenState();
              statehttp.onreadystatechange = html5statecallback;
              statehttp.open('GET', url, true);
              statehttp.send(null);
            }
      break;
    }
}

function html5statecallback () {
  if (statehttp.readyState == 4) {
      if (statehttp.status == 200) {
          var state = newinPlayer.getOpenState();
          if (state == NPlayer.OpenState.Opened) {
              if (videoStartFlag == true) {
                  setTimeout('starthtml5State()', 2000);
                }
            }
        } else if (statehttp.status == PROXY_ERROR_FORCE_STOP) {
          var msg = NPLAYER_PLAYER_STOP_REQUEST_MSG;
          newinPlayer.stop();
          newinPlayer.close();
          setTimeout(function () {
              alert(msg);
              setTimeout(function () {
                  window.close();
                    // alert(msg);
                }, 1000);
            }, 200);
        } else if (statehttp.status == PROXY_ERROR_DUP_CHECKED) {
          if (dupProxycallback == 'function') {
              dupProxycallback();
            } else {
              var msg = NPLAYER_DUP_MSG;
              newinPlayer.stop();
              newinPlayer.close();
              setTimeout(function () {
                  alert(msg);
                  setTimeout(function () {
                      window.close();
                    }, 1000);
                }, 200);
            }
        } else if (statehttp.status == PROXY_ERROR_CAPTURE_ENABLED) {
          var msg = STR_PROXY_ERROR_CAPTURE_ENABLED;
          newinPlayer.stop();
          newinPlayer.close();
          setTimeout(function () {
              alert(msg);
              setTimeout(function () {
                  window.close();
                }, 1000);
            }, 200);
        } else {
          console.log('html5statecallback readyState==' + statehttp.readyState);
          console.log('html5statecallback status==' + statehttp.status);
          var state = newinPlayer.getOpenState();
          if (state == NPlayer.OpenState.Opened) {
              if (videoStartFlag == true) {
                  setTimeout('starthtml5State()', 2000);
                }
            }
        }
    } else {}
}

function Stophtml5State (state) {
  stopstatehttp = createXMLHttpRequest();
  var url = proxy_state_host + '/mediastate?mediaKey=' + media_auth + '&openstate=' + state;
  stopstatehttp.open('GET', url, true);
  stopstatehttp.send(null);
}

function authdelete () {
  stopstatehttp = createXMLHttpRequest();
  var url = proxy_state_host + '/delgenauth?mediaKey=' + media_auth;
  stopstatehttp.open('GET', url, true);
  stopstatehttp.send(null);
}

function get_browser () {
  var ua = navigator.userAgent,
      tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return {
          name: 'IE',
          version: (tem[1] || '')
        };
    }
  if (M[1] === 'Chrome') {
      tem = ua.match(/\bOPR\/(\d+)/);
      if (tem != null) {
          return {
              name: 'Opera',
              version: tem[1]
            };
        }
    }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
  if ((tem = ua.match(/version\/(\d+)/i)) != null) {
      M.splice(1, 1, tem[1]);
    }
  M[0] = M[0].toLowerCase();
  return {
      name: M[0],
      version: M[1]
    };
}

function callErrorState () {
  callerrorhttp = createXMLHttpRequest();
  var url = proxy_state_host + '/errstate';
  callerrorhttp.onreadystatechange = callErrorStateresponse;
  callerrorhttp.open('GET', url, true);
  callerrorhttp.send(null);
}

function callErrorStateresponse () {
  if (callerrorhttp.readyState == 4) {
      console.log(callerrorhttp.responseText + '==code===' + callerrorhttp.status);
      switch (callerrorhttp.status) {
        case PROXY_ERROR_UNKONWN:
          onErrorMessage(STR_PROXY_ERROR_UNKONWN);
          break;
        case PROXY_ERROR_ACTIVE_NOT_CLEARED:
          onErrorMessage(STR_PROXY_ERROR_ACTIVE_NOT_CLEARED);
          break;
        case PROXY_ERROR_AUTH_NOT_FOUND:
          onErrorMessage(STR_PPROXY_ERROR_AUTH_NOT_FOUND);
          break;
        case PROXY_ERROR_AUTH_HTTP_403:
          onErrorMessage(STR_PPROXY_ERROR_AUTH_HTTP_403);
          break;
        case PROXY_ERROR_AUTH_HTTP_404:
          onErrorMessage(STR_PPROXY_ERROR_AUTH_HTTP_404);
          break;
        case PROXY_ERROR_BLOCKED_HTTP:
          onErrorMessage(STR_PPROXY_ERROR_BLOCKED_HTTP);
          break;
        }
    }
}

function onErrorMessage (e) {
  $('#video-nplayer-1-msg tr td').text(e);
}
var AgentCheckCallback;
var gtimer, gtimeout, eventhandler;

function checkNRunProxyAgent (callback, time) {
  AgentCheckCallback = callback;
  portcheckhandler = function () {
      ProxyPortCheck();
    };
  timeouthandler = function () {
      window.clearInterval(gtimer);
      ProxyPortCheckFail();
    };
  gtimer = window.setInterval(portcheckhandler, 1000);
  proxycheckTimer = window.setTimeout(timeouthandler, time);
}

function checkNRunProxyAgentOnce (callback, time) {
  AgentCheckCallback = callback;
  portcheckhandler = function () {
      ProxyPortCheck();
    };
  timeouthandler = function () {
      window.clearInterval(gtimer);
      ProxyPortCheckFail();
    };
  portcheckhandler();
  proxycheckTimer = window.setTimeout(timeouthandler, time);
}

function ProxyPortCheck () {
  proxyHealthhttp = createXMLHttpRequest();
  proxyHealthchecked = false;
  var url = proxy_state_host + '/portcheck';
  proxyHealthhttp.onreadystatechange = ProxyPortCheckHandler;
  proxyHealthhttp.open('GET', url, true);
  proxyHealthhttp.send(null);
}

function ProxyPortCheckHandler () {
  if (proxyHealthhttp.readyState == 4) {
      if (proxyHealthhttp.status == 200) {
          proxyHealthchecked = true;
          window.clearInterval(gtimer);
          window.clearTimeout(gtimeout);
          window.removeEventListener('blur', eventhandler, false);
          if (typeof AgentCheckCallback === 'function') {
              AgentCheckCallback(true);
            }
        }
    }
}

function ProxyPortCheckFail () {
  if (proxyHealthchecked == false) {
      if (typeof AgentCheckCallback === 'function') {
          AgentCheckCallback(false);
        }
    }
}

function ExitProxyServer () {
  exithttp = createXMLHttpRequest();
  var url = proxy_state_host + '/exit';
  exithttp.open('GET', url, true);
  exithttp.send(null);
}
var checkversioncallback;

function versionCheck (callback) {
  checkversioncallback = callback;
  getProxyVer();
}

function compareversion (a, b) {
    // console.log(a);
    // console.log(b);
  if (a === b) {
      return 0;
    }
  var a_components = a.split(',');
  var b_components = b.split(',');
  var len = Math.min(a_components.length, b_components.length);
    // loop while the components are equal`
  for (var i = 0; i < len; i++) {
        // A bigger than B
      if (parseInt(a_components[i]) > parseInt(b_components[i])) {
          return 1;
        }
        // B bigger than A
      if (parseInt(a_components[i]) < parseInt(b_components[i])) {
          return -1;
        }
    }
    // If one's a prefix of the other, the longer one is greater.
  if (a_components.length > b_components.length) {
      return 1;
    }
  if (a_components.length < b_components.length) {
      return -1;
    }
    // Otherwise they are the same.
  return 0;
}

function getProxyVer () {
  proxyverhttp = createXMLHttpRequest();
  var url = proxy_state_host + '/version';
  proxyverhttp.open('GET', url, true);
  proxyverhttp.send(null);
  proxyverhttp.onreadystatechange = function () {
      if (proxyverhttp.readyState == 4) {
            // console.log(proxyverhttp.responseText+" code __ "+proxyverhttp.status);
          if (proxyverhttp.status == 200) {
              if (compareversion(proxy_ver, proxyverhttp.responseText) > 0) {
                  if (typeof checkversioncallback === 'function') {
                      checkversioncallback(true);
                    }
                } else {
                  if (typeof checkversioncallback === 'function') {
                      checkversioncallback(false);
                    }
                }
            } else {
              indicateRunFail();
            }
        };
    };
}

function launchProxy (uri, successCallback, noHandlerCallback, unknownCallback) {
  var res, parent, popup, iframe, blurHandler, timeout, timeoutHandler, browser, notblur = true;

  function callback (cb) {
      if (typeof cb === 'function') cb();
    }

  function createHiddenIframe (parent) {
      var iframe;
      if (!parent) parent = document.body;
      iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.id = 'hiddenIframe';
      iframe.src = 'about:blank';
      parent.appendChild(iframe);
      return iframe;
    }

  function removeHiddenIframe (parent) {
      if (!iframe) return;
      if (!parent) parent = document.body;
      parent.removeChild(iframe);
      iframe = null;
    }
  browser = {
      isChrome: false,
      isFirefox: false,
      isIE: false,
      isSafari: false,
      isEdge: false
    };
  if (navigator.userAgent.match(/Edge\//)) {
      browser.isEdge = true;
    } else if (window.chrome && !navigator.userAgent.match(/Opera|OPR\//)) {
      browser.isChrome = true;
    } else if (typeof InstallTrigger !== 'undefined') {
      browser.isFirefox = true;
    } else if ('ActiveXObject' in window) {
      browser.isIE = true;
    } else if (navigator.userAgent.match(/Safari\//)) {
      browser.isSafari = true;
    }

  function AgentCheckCallback (result) {
      if (result == true) {
          callback(successCallback);
        } else {
          if (browser.isChrome && !notblur) {
              callback(indicateRunFail);
            } else {
              callback(noHandlerCallback);
            }
        }
    }
    // Blur hack (Chrome)
  if ((browser.isChrome && !isMac) || browser.isEdge) { //
      blurHandler = function () {
          notblur = false;
          window.clearTimeout(timeout);
          window.clearInterval(gtimer);
          window.clearTimeout(gtimeout);
          window.removeEventListener('blur', blurHandler, false);
          if (browser.isEdge) {
              callback(noHandlerCallback);
            } else {
            	// 여기가
              checkNRunProxyAgent(AgentCheckCallback, 8000);
            }
        };
      timeoutHandler = function () {
          window.clearTimeout(gtimeout);
          window.removeEventListener('blur', blurHandler, false);
          checkNRunProxyAgent(AgentCheckCallback, 3000);
            // if(proxyHealthchecked==false) { callback(noHandlerCallback);}
        };
      eventhandler = blurHandler;
      window.addEventListener('blur', blurHandler, false);
      window.location.href = uri;
      timeout = window.setTimeout(timeoutHandler, 2000);
    }
    // Proprietary msLaunchUri method (IE 10+ on Windows 8+)
  else if (navigator.msLaunchUri) {
      navigator.msLaunchUri(uri, successCallback, noHandlerCallback);
    }
    // Catch NS_ERROR_UNKNOWN_PROTOCOL exception (Firefox)
  else if (browser.isFirefox) {
      iframe = createHiddenIframe();
      try {
            // if we're still allowed to change the iframe's location, the protocol is registered
          iframe.contentWindow.location.href = uri;
            // callback(successCallback);
          checkNRunProxyAgent(AgentCheckCallback, 8000);
        } catch (e) {
          if (e.name === 'NS_ERROR_UNKNOWN_PROTOCOL') {
              callback(noHandlerCallback);
            } else {
              callback(unknownCallback);
            }
        } finally {
          removeHiddenIframe();
        }
    }
    // Open popup, change location, check wether we can access the location after the change (IE on Windows < 8)
  else if (browser.isIE) {
      popup = window.open('', 'launcher', 'width=0,height=0');
      popup.location.href = uri;
      try {
            // Try to change the popup's location - if it fails, the protocol isn't registered
            // and we'll end up in the `catch` block.
          popup.location.href = 'about:blank';
            // callback(successCallback);
          checkNRunProxyAgent(AgentCheckCallback, 8000);
            // The user will be shown a modal dialog to allow the external application. While
            // this dialog is open, we cannot close the popup, so we try again and again until
            // we succeed.
          var timer = window.setInterval(function () {
              popup.close();
              if (popup.closed) window.clearInterval(timer);
            }, 500);
        } catch (e) {
            // Regain access to the popup in order to close it.
          popup = window.open('about:blank', 'launcher');
          popup.close();
          callback(noHandlerCallback);
        }
    }
    // No hack we can use, just open the URL in an hidden iframe and invoke `unknownCallback`
  else {
      iframe = createHiddenIframe();
      iframe.contentWindow.location.href = uri;
      timeoutHandler = function () {
          window.clearTimeout(timeout);
          checkNRunProxyAgent(AgentCheckCallback, 4000);
        };
      timeout = window.setTimeout(timeoutHandler, 2000);
    }
}
var playruncallback;

function mygentAuthCall (playcallback, authparam1) {
  playruncallback = playcallback;
  gentAuthhttp = createXMLHttpRequest();
  var url = proxy_state_host + '/genauth?genparam=' + authparam1;
  gentAuthhttp.onreadystatechange = mygentAuthCallHandler;
  gentAuthhttp.open('GET', url, true);
  gentAuthhttp.send(null);
}

function mygentAuthCallHandler () {
  if (gentAuthhttp.readyState == 4) {
      if (gentAuthhttp.status == 200) {
          if (typeof playruncallback === 'function') {
              playruncallback(gentAuthhttp.responseText);
            }
        }
    }
}

function proxy_init (runcallback, installcallback, updatecallback) {
  checkNRunProxyAgentOnce(AgentCheckCallback, 2000);
//    show_loading(true);

  function LaunchSucess () {
      versionCheck(VersionCheckCallback);
    }

  function VersionCheckCallback (result) {
      if (result == true) {
          updatecallback();
        } else {
//            show_loading(false);
          runcallback();
        }
    }

  function AgentCheckCallback (result) {
      if (result == true) {
          versionCheck(VersionCheckCallback);
        } else {
          var href = 'cdnproxy://launch';
          launchProxy(href, LaunchSucess, installcallback, installcallback);
        }
    }
}

function indicateUpdate () {
  var html = '<div id=\'area_meg\' style=\'display:table; width:100%;height:100%;\'><p id=\'pmsg\' style=\'display:table-cell; color:#7d7d7d;text-align:center;vertical-align:middle\'>';
  html = html + '<a href=\'' + setup_url + '\'><img src=\'images/download.png\' border=\'0\' /></a><br><span style=\'color:#00ff00\'>AquaNPlayer</span> 업데이트가 필요합니다.<br>동영상을 시청하려면 <span style=\'color:#ff4f4f\'>수동 설치 프로그램을 내려받아</span> 설치 후 페이지를 새로고침 해 주세요.';
  html = html + '</p></div>';
  $('#video').empty().append(html);
}

function indicateInstall () {
  var html = '<div id=\'area_meg\' style=\'display:table; width:100%;height:100%;\'><p id=\'pmsg\' style=\'display:table-cell; color:#7d7d7d;text-align:center;vertical-align:middle\'>';
  html = html + '<a href=\'' + setup_url + '\'><img src=\'images/download.png\' border=\'0\' /></a><br>동영상을 시청하려면 <span style=\'color:#00ff00\'>AquaNPlayer</span> <span style=\'color:#ff4f4f\'>수동 설치 프로그램을 내려받아</span> 설치하여 주십시오.<br>플레이어 설치 후 페이지를 새로고침 해 주세요.';
  html = html + '</p></div>';
  $('#video').empty().append(html);
}

function indicateRunFail () {
  var html = '<div id=\'area_meg\' style=\'display:table; width:100%;height:100%;\'><p id=\'pmsg\' style=\'display:table-cell; color:#fff;text-align:center;vertical-align:middle\'>';
  html = html + '강의 시청을 위한 플레이어 구동에 실패 하였습니다.<br>팝업 화면에서 AquaNPlayer proxy agent 열기를 선택 후 새로고침 해주세요.';
  html = html + '</p></div>';
  $('#video').empty().append(html);
}

function show_loading (state) {
  if (state == true) {
      var html = '<div id=\'video-loading\' style=\'display:table; width:100%;height:100%;\'><p id=\'video-loading-p\' style=\'display:table-cell; color:#7d7d7d;text-align:center;vertical-align:middle\'>';
      html = html + '<img src=\'images/video-loading.gif\' />';
      html = html + '</p></div>';
      $('#video').prepend(html);
    } else {
      $('#video-loading').fadeOut(300, function () {
          $(this).remove();
        });
    }
}
