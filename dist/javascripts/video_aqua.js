"use strict";window.requirejs(["jquery","axios","aquaNManagerService"],function(i,r,e){var a=i(".videoplayer"),n=i("#btn_play_video");i(function(){var i={videoUrl:"cdnetworks.mp4",trainingUserId:a.data("training-user-id"),courseId:a.data("course-id"),courseListId:a.data("course-list-id")};e=new e(i)}),n.on("click",function(){e.startPlayer()})});
//# sourceMappingURL=../maps/video_aqua.js.map
