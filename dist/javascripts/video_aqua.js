"use strict";window.requirejs(["jquery","axios","aquaNManagerService","easyTimer","jqueryTimer"],function(t,e,n,i){function a(){t.ajax({type:"POST",url:"/session/log/starttime",data:{training_user_id:c.data("training-user-id"),course_id:c.data("course-id"),course_list_id:c.data("course-list-id")}}).done(function(t){t.success||console.error(t.msg)})}function o(){t.ajax({type:"POST",url:"/session/log/endtime",data:{training_user_id:c.data("training-user-id"),course_id:c.data("course-id"),course_list_id:c.data("course-list-id")}}).done(function(t){t.success?window.location.href=_:console.error(t.msg)})}function s(){"done"===c.data("status")&&(f.removeClass("blind"),g.addClass("blind"))}function r(){return e.delete("/video/log",{params:{video_id:c.data("id")}}).then(function(t){}).catch(function(t){console.error(t)})}function d(){return e.delete("/session/log",{params:{training_user_id:c.data("training-user-id"),course_list_id:c.data("course-list-id")}}).then(function(t){}).catch(function(t){console.error(t)})}var u,c=t(".videoplayer"),l=t("#btn_play_video"),f=t("#btn_play_next"),_=f.parent().attr("href"),g=t("#btn_replay_video"),m=t("#countdown .values");t(function(){var a={videoUrl:"cdnetworks.mp4",trainingUserId:c.data("training-user-id"),courseId:c.data("course-id"),courseListId:c.data("course-list-id"),videoId:c.data("id"),videoStatus:c.data("status"),totalPlayedSeconds:c.data("total-play")};n=new n(a),"1"==c.data("confirm")&&(t(".timer").removeClass("blind"),setTimeout(function(){u=new i,u.start({countdown:!0,startValues:{seconds:30}}),m.html(u.getTimeValues().toString()+" 초 이내 <b>다음</b> 버튼을 클릭해주세요."),u.addEventListener("secondsUpdated",function(t){m.html(u.getTimeValues().toString()+" 초 이내 <b>다음</b> 버튼을 클릭해주세요.")}),u.addEventListener("targetAchieved",function(t){m.html("학습 초기화 중입니다.."),setTimeout(function(){window.alert("30초 동안 다음 버튼을 누르지 않아 학습을 초기화 하였습니다.\n\n재시청 해주시기 바랍니다."),e.all([r(),d()]).then(e.spread(function(t,e){window.location.reload()}))},3e3)})},1e3)),s()}),l.on("click",function(){a(),n.startPlayer()}),f.on("click",function(t){t.preventDefault(),o()})});
//# sourceMappingURL=../maps/video_aqua.js.map
