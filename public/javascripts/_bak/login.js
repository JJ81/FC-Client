/**
 * Created by yijaejun on 01/12/2016.
 */
'use strict';
requirejs(
	[
		'jquery'
		,'jqueryCookie'
	],
	function (jQuery) {
		var $ = jQuery;
		var
			//remember = $('#remember'),  // 자동 로그인 유무         
			password = $('#password'),  // 암호
            savePhone = $('savePhone'), // 핸드폰 저장유무		
			btn_login =$('.btn_login'); 

    checkCookie();

		/**
		 * TODO 1. 쿠키를 저장한 사용자는 agent값을 가져온다, 저장하지 않은 사용자는 가져오지 않는다
		 * TODO 2. 쿠키를 저장한 사용자는 rememeber me 체크박스가 체크되있어야 한다. 저장하지 않은 사용자는 체크가 안되있어야 한다
		 * TODO 3. 처음 remember me를 체크한 유저는 submit 클릭시 쿠키를 저장한다.
		 * TODO 4. 쿠키 저장 사용자가 remember me 체크를 해제하면 쿠키 삭제 여부를 묻고 삭제 한다
		 *
		 * */
		btn_login.bind('click', function(){
			/* 쿠키 값이 없고, remember me checked 되있는 경우에 쿠키 값을 저장한다*/
			if($.cookie('agent')=== undefined && remember.prop('checked')){
				setCookie(agent.val());
			}
		});

		remember.change('click', function(){
			if(!$(this).prop('checked')){
				if($.cookie('agent') !=undefined){ /*쿠키 값이 있고, remember가 체크 되있는 경우에 쿠키 삭제 가능*/
					removeCookie();
				}
			}
		});

		function setCookie(agent){
			$.cookie('agent', agent);
		}

		function getCookie(){
			agent.val($.cookie('agent'));
		}

		function checkCookie(){
			if($.cookie('agent')=== undefined){
				remember.prop('checked', false);
			}else{
				remember.prop('checked', true);
				getCookie();
			}
		}

		function removeCookie(){
			var removeCookie = confirm('저장된 아이디를 삭제하시겠습니까?');
			if(removeCookie){
				$.removeCookie('agent');
			}
		}


	} // end of function
);
