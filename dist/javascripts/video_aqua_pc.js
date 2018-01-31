"use strict";window.requirejs(["common","aquaPlayerService","easyTimer","text!/win_aquaplayer_html5.html","text!/win_aquaplayer_window.html"],function(e,n,t,a,o){function i(){_.setVolume(.5),_.bindEvent("Error",function(e,n){console.error(n)}),_.bindEvent("OpenStateChanged",function(e){switch(e){case window.NPlayer.OpenState.Opened:console.info("player: playing"),N=_.getDuration(),D<N-5&&window.confirm("마지막 재생시점으로 이동하시겠습니까?")&&_.setCurrentPlaybackTime(D),r();break;case window.NPlayer.OpenState.Closed:console.log("closed")}}),_.bindEvent("PlayStateChanged",function(e){switch(e){case window.NPlayer.PlayState.Playing:c(),k.reset(1e3*S);break;case window.NPlayer.PlayState.Stopped:case window.NPlayer.PlayState.Paused:console.info("player: stop/pause"),k.pause(),l()}}),_.bindEvent("PlaybackCompleted",function(){console.info("player: ended"),k.pause(),p(),l(),E||setTimeout(function(){g(".timer").removeClass("blind"),console.log("second timer started"),T.start({countdown:!0,startValues:{seconds:30}}),O.html(T.getTimeValues().toString()+" 초 이내 <b>다음</b> 버튼을 클릭해주세요."),T.addEventListener("secondsUpdated",function(e){O.html(T.getTimeValues().toString()+" 초 이내 <b>다음</b> 버튼을 클릭해주세요.")}),T.addEventListener("targetAchieved",function(e){O.html("학습 초기화 중입니다.."),setTimeout(function(){window.alert("30초 동안 다음 버튼을 누르지 않아 학습을 초기화 하였습니다.\n\n재시청 해주시기 바랍니다."),y.all([f(),m()]).then(y.spread(function(e,n){window.location.reload()}))},3e3)})},1e3)})}function r(){N?(k=g.timer(1e3*S,s,!0),k.stop(),d()):console.error("을 확인할 수 없습니다.")}function d(){p()}function s(){console.log("video played time logging..."),C+=S;var e=_.getCurrentPlaybackTime();if(w>0&&w===e)return _.pause(),void P.removeClass("blind");w=e,g.ajax({type:"POST",url:"/video/log/playtime",data:{training_user_id:H,video_id:j,played_seconds:C,video_duration:N,currenttime:e}}).done(function(e){e.success?(C=0,V=e.total_played_seconds,p()):(console.error(e.msg),_.pause().then(function(){}).catch(function(e){console.error(e)}))})}function l(){console.log("video log end"),g.ajax({type:"POST",url:"/video/log/endtime",data:{video_id:j}}).done(function(e){e.success||console.error(e.msg)})}function c(){g.ajax({type:"POST",url:"/session/log/starttime",data:{training_user_id:b.data("training-user-id"),course_id:b.data("course-id"),course_list_id:b.data("course-list-id")}}).done(function(e){e.success?E=e.hasEnded:(console.error(e.msg),k.stop(),_.stop())})}function u(){g.ajax({type:"POST",url:"/session/log/endtime",data:{training_user_id:b.data("training-user-id"),course_id:b.data("course-id"),course_list_id:b.data("course-list-id")}}).done(function(e){e.success?window.location.href=q:console.error(e.msg)})}function p(){Math.floor(N*(x/100))<=V&&(h.removeClass("blind"),P.addClass("blind"))}function f(){return y.delete("/video/log",{params:{video_id:b.data("id")}}).then(function(e){}).catch(function(e){console.error(e)})}function m(){return y.delete("/session/log",{params:{training_user_id:b.data("training-user-id"),course_list_id:b.data("course-list-id")}}).then(function(e){}).catch(function(e){console.error(e)})}var w,g=g||window.$,y=y||window.axios,v=e.getOSName(),_=null,b=g(".videoplayer"),h=(g("#aqua-html5"),g("#aqua-window"),g("#btn_play_next")),P=g("#btn_replay_video"),S=b.data("interval"),k=null,C=0,T=new t,O=g("#countdown .values"),x=b.data("passive-rate"),E=!1,q=h.parent().attr("href"),N=null,j=b.data("id"),V=b.data("total-play"),D=b.data("current-time"),H=h.data("training-user-id");g(function(){var e={fileUrl:g("#video").data("url"),watermark:g("#video").data("watermark"),callback:function(e){e&&(_=e,i())}};n=new n(e);var t,r={url:b.data("url"),watermark:b.data("watermark")};t="Windows"===v?window.Handlebars.compile(o):window.Handlebars.compile(a),g("#aqua-player").append(t(r))}),h.on("click",function(e){e.preventDefault(),T.stop(),u()}),P.on("click",function(e){e.preventDefault(),_.play(),P.addClass("blind")})});
//# sourceMappingURL=../maps/video_aqua_pc.js.map
