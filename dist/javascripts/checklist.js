"use strict";window.requirejs(["jquery"],function(e){function t(){e.ajax({type:"POST",url:"/session/log/starttime",data:{training_user_id:r,course_id:c,course_list_id:n}}).done(function(e){e.success||console.error(e.msg)})}function a(){e.ajax({type:"POST",url:"/session/log/endtime",data:{training_user_id:r,course_id:c,course_list_id:n}}).done(function(e){e.success?window.location.href=d:console.error(e.msg)})}var s=e("#btn_submit_answers"),i=e("#btn_play_next"),r=i.data("training-user-id"),c=i.data("course-id"),n=i.data("course-list-id"),d=i.attr("href");e(function(){t()}),e('[name*="sample-"]').click(function(){var t=e(this).parent(),a=t.parent(),s=a.children().children(e('[name*="sample-"]'));t.hasClass("active")?(e(this).removeAttr("checked").prop("checked",!1),t.removeClass("active focus")):(t.addClass("active focus"),e(this).attr("checked","checked").prop("checked",!0),"choose"!==a.data("type")&&s.not(e(this)).removeAttr("checked").prop("checked",!1).parent().removeClass("active focus"))}),i.on("click",function(e){e.preventDefault(),a()}),s.on("click",function(t){t.preventDefault();var a=[],d=0;e(".checklist-item").each(function(t){var s=e(this).data("id"),i=e(this).data("type"),r=!0;switch(i){case"write":""===e(this).val()&&(r=!1),a.push({id:s,answer:e(this).val()});break;default:var c=e(this).find("input:checked").map(function(){return e(this).val()}).get().join(";");""===c&&(r=!1),a.push({id:s,answer:c})}r?(e(".alert[data-id="+s+"]").removeClass("alert-danger"),e(".alert[data-id="+s+"]").addClass("alert-success")):(d++,e(".alert[data-id="+s+"]").removeClass("alert-success"),e(".alert[data-id="+s+"]").addClass("alert-danger"))}),0===d?e.ajax({type:"POST",url:"/checklist/submit",data:{answers:a,training_user_id:r,course_id:c,course_list_id:n}}).done(function(e){e.success?(window.alert("성실히 답변해주셔서 감사합니다"),s.addClass("blind"),i.removeClass("blind"),i.click()):console.error(e.msg)}):window.alert("작성하지 않은 항목이 존재합니다")})});