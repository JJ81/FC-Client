"use strict";window.requirejs(["common","aquaPlayerService","easyTimer","jqueryTimer"],function(e,n,t){function o(){y.setVolume(.5),y.bindEvent("Error",function(e,n){console.error(n)}),y.bindEvent("OpenStateChanged",function(e){switch(e){case window.NPlayer.OpenState.Opened:console.info("player: playing"),x=y.getDuration(),V<x-5&&window.confirm("마지막 재생시점으로 이동하시겠습니까?")&&y.setCurrentPlaybackTime(V).then(function(e){y.pause()}).catch(function(e){console.error(e)}),a();break;case window.NPlayer.OpenState.Closed:console.log("closed")}}),y.bindEvent("PlayStateChanged",function(e){switch(e){case window.NPlayer.PlayState.Playing:d(),T.reset(1e3*S);break;case window.NPlayer.PlayState.Stopped:case window.NPlayer.PlayState.Paused:console.info("player: stop/pause"),T.pause(),s()}}),y.bindEvent("PlaybackCompleted",function(){console.info("player: ended"),T.pause(),c(),s(),E||setTimeout(function(){m(".timer").removeClass("blind"),console.log("second timer started"),k.start({countdown:!0,startValues:{seconds:30}}),O.html(k.getTimeValues().toString()+" 초 이내 <b>다음</b> 버튼을 클릭해주세요."),k.addEventListener("secondsUpdated",function(e){O.html(k.getTimeValues().toString()+" 초 이내 <b>다음</b> 버튼을 클릭해주세요.")}),k.addEventListener("targetAchieved",function(e){O.html("학습 초기화 중입니다.."),setTimeout(function(){window.alert("30초 동안 다음 버튼을 누르지 않아 학습을 초기화 하였습니다.\n\n재시청 해주시기 바랍니다."),g.all([u(),f()]).then(g.spread(function(e,n){window.location.reload()}))},3e3)})},1e3)})}function a(){x?(T=m.timer(1e3*S,r,!0),T.stop(),i()):console.error("을 확인할 수 없습니다.")}function i(){c()}function r(){console.log("logging..."),C+=S;var e=y.getCurrentPlaybackTime();if(p>0&&p===e)return y.pause(),void P.removeClass("blind");p=e,m.ajax({type:"POST",url:"/video/log/playtime",data:{training_user_id:D,video_id:N,played_seconds:C,video_duration:x,currenttime:e}}).done(function(e){e.success?(C=0,q=e.total_played_seconds,c()):(console.error(e.msg),y.pause().then(function(){}).catch(function(e){console.error(e)}))})}function s(){console.log("video log end"),m.ajax({type:"POST",url:"/video/log/endtime",data:{video_id:N}}).done(function(e){e.success||console.error(e.msg)})}function d(){m.ajax({type:"POST",url:"/session/log/starttime",data:{training_user_id:v.data("training-user-id"),course_id:v.data("course-id"),course_list_id:v.data("course-list-id")}}).done(function(e){e.success?E=e.hasEnded:(console.error(e.msg),T.stop(),y.stop())})}function l(){m.ajax({type:"POST",url:"/session/log/endtime",data:{training_user_id:v.data("training-user-id"),course_id:v.data("course-id"),course_list_id:v.data("course-list-id")}}).done(function(e){e.success?window.location.href=j:console.error(e.msg)})}function c(){"done"===v.data("status")&&(b.removeClass("blind"),P.addClass("blind"))}function u(){return g.delete("/video/log",{params:{video_id:v.data("id")}}).then(function(e){}).catch(function(e){console.error(e)})}function f(){return g.delete("/session/log",{params:{training_user_id:v.data("training-user-id"),course_list_id:v.data("course-list-id")}}).then(function(e){}).catch(function(e){console.error(e)})}var p,m=m||window.$,g=g||window.axios,w=e.getOSName(),y=null,v=m(".videoplayer"),_=m("#aqua_html5"),h=m("#aqua_html5"),b=m("#btn_play_next"),P=m("#btn_replay_video"),S=v.data("interval"),T=null,C=0,k=new t,O=m("#countdown .values"),E=!1,j=b.parent().attr("href"),x=null,N=v.data("id"),q=v.data("total-play"),V=v.data("current-time"),D=b.data("training-user-id");m(function(){"Windows"===w?_.show():h.show();var e={fileUrl:m("#video").data("url"),watermark:m("#video").data("watermark"),callback:function(e){e&&(y=e,o())}};n=new n(e)}),b.on("click",function(e){e.preventDefault(),k.stop(),l()}),P.on("click",function(e){e.preventDefault(),y.play(),P.addClass("blind")})});
//# sourceMappingURL=../maps/video_aqua_pc.js.map
