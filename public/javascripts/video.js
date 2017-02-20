/**
 * 비디오 세션 학습 
 */

'use strict';

requirejs(
    [      
		'jquery',
	    'axios',
	    'Vimeo',    
      'jqueryTimer',
    ],
    function ($, axios, Vimeo) {
        
        var player = null,
            player_container = $('#videoplayer'),
			timer_logging_interval = player_container.data('interval'), // log every 5 seconds
			timer_log = null,
			timer_wait = null, // 비디오 시청 종료 후 다음 버튼을 누르도록 강요하는 타이머 
			timer_log_played_seconds = 0, // 시청시간(초)
			timer_waiting_seconds = player_container.data('wait-seconds'), // 다음버튼을 노출하는데 까지 대기하는 시간  
      passive_rate = player_container.data('passive-rate'), // 다음 버튼을 노출하는 시점

			btn_play = $('.btn_play'),
			next_url = btn_play.parent().attr('href'),

			video_id = player_container.data('id'), // video 테이블의 id
			video_total_played_seconds = player_container.data('total-play'), // 비디오 총 시청시간
			video_currenttime = player_container.data('current-time'), // 마지막 재생시점
			training_user_id = btn_play.data('training-user-id'),
			course_id = btn_play.data('course-id'),
			course_list_id = btn_play.data('course-list-id'),
			
			video_duration = null, // 비디오 러닝타임
			wait_message = $('.wait-message'),
			session_has_ended = false;
		
		/**
		 * entry point
		 */
        $(function () {

          initPlayer ();

        }); // $(function

		/**
		 * Player 를 초기화 한다.
		 */
		function initPlayer () {
		
			var options = {
				loop: false,
			};	
			player = new Vimeo('videoplayer', options);
      player.setVolume(0.5); // 볼륨설정

			player.ready().then(function() {
				console.info("Player is ready.");

				player.getDuration().then(function(duration) {
					video_duration = duration; // 비디오 지속시간 구하기
					setPlayer();
				}).catch(function(error) {
					console.error(error);
				});
				
				if (video_currenttime < video_duration - 5) {
					if (confirm("마지막 재생시점으로 이동하시겠습니까?")) {
						player.setCurrentTime(video_currenttime).then(function(seconds) {
							player.pause();
						}).catch(function(error) {
							console.error(error);
						});		
					}	
				}

			}).catch(function(error) {
				console.error(error);
			});		
		}

        /**
         * Player 를 셋팅한다.
         */
        function setPlayer () {

          if (video_duration) {
            timer_log = $.timer(1000 * timer_logging_interval, videoPlayTimeLogger, true);
            timer_log.stop();						
            checkVideoDuration();
          } else {
            console.error("재생시간을 확인할 수 없습니다.");
          }

        }

		/**
		 * 비디오 재생시간이 존재하는지 여부 체크
		 */		
		function checkVideoDuration () {
			
			// video_duration = getPlayerDuration();
			
			// 총 릴타임의 80% 이상을 시청한 경우 다음버튼을 활성화 한다.
			showPlayBtn (video_total_played_seconds);
		}		

		/**
		 * 총 릴타임의 80% 이상을 시청한 경우 다음버튼을 활성화 한다.
		 */		
		function showPlayBtn (total_played_seconds) {

			if (Math.floor(video_duration * (passive_rate / 100)) <= total_played_seconds) {
				btn_play.removeClass('blind');
			}

		}		

		/**
		 * 비디오 지속시간(초 단위)을 구한다.
		 */
		function getPlayerDuration() {

          player.getDuration().then(function(duration) {
              return duration;
          }).catch(function(error) {
              console.error(error);
			  return 0;
          });

		}

		/**
		 * 비디오 현재 재생중인 시점(초 단위)을 구한다.
		 */
		function getPlayerCurrentTime() {

          player.getCurrentTime().then(function(seconds) {
			  return seconds;
          }).catch(function(error) {
              console.error(error);
			  return 0;
          });    

		}		

		/**
		 * 시청시간 로깅
		 */		
		function videoPlayTimeLogger () {

			timer_log_played_seconds += timer_logging_interval;

			player.getCurrentTime().then(function(seconds) {
				
				$.ajax({   
					type: "POST",
					url: "/video/log/playtime",   
					data: { 
						training_user_id: training_user_id, 
						video_id: video_id,
						played_seconds: timer_log_played_seconds, 
						video_duration: video_duration,
						currenttime: seconds
					}   
				}).done(function (res) { 
					if (!res.success) {
						console.error(res.msg);

						// 오류 발생 시 타이머와 비디오 재생을 멈춘다.
						timer_log.stop();
						player.stop();
					} else {
						// console.info('logged (duration : ' + video_duration + ' / total played seconds : ' + res.total_played_seconds + ')');
						timer_log_played_seconds = 0;

						// 총 릴타임의 80% 이상을 시청한 경우 다음버튼을 활성화 한다.
						video_total_played_seconds = res.total_played_seconds;
						showPlayBtn (video_total_played_seconds);
					} 
				});

			}).catch(function(error) {
				console.error(error);
			});

		}

		/**
		 * 비디오 시청 종료시간 로깅
		 */
		function videoEndTimeLogger () {

			$.ajax({   
				type: "POST",
				url: "/video/log/endtime",   
				data: { 
					video_id: video_id
				}
			}).done(function (res) { 
				if (!res.success) {
					console.error(res.msg);
				} else {
					// console.info('종료시간 기록!');
				} 
			});
			
		} 		

		/**
		 * 세션 시작일시 로깅
		 */		
		function sessionProgressStartLogger () {

			$.ajax({   
				type: "POST",
				url: "/session/log/starttime",
				data: { 
          training_user_id: training_user_id, 
          course_id: course_id, 
          course_list_id: course_list_id 
        }   
			}).done(function (res) { 
        if (!res.success) {
          console.error(res.msg);
          // 오류 발생 시 타이머와 비디오 재생을 멈춘다.
          timer_log.stop();
          player.stop();            
        } else {
          session_has_ended = res.hasEnded; // 세션 종료여부
          // console.info('세션 시작시간 기록');
        } 
			});

		}		

		/**
		 * 세션 종료일시 로깅
		 */		
		function sessionProgressEndLogger () {

			$.ajax({   
				type: "POST",
				url: "/session/log/endtime",
				data: { 
					training_user_id: training_user_id, 
					course_id: course_id, 
					course_list_id: course_list_id 
				}
			}).done(function (res) { 
				if (!res.success) {
					console.error(res.msg);
					// 오류 발생 시 타이머와 비디오 재생을 멈춘다.
					timer_log.stop();
					player.stop();                
				} else {
					// console.info('세션 종료시간 기록');
					location.href = next_url;
				} 
			});

		}  		

		/**
		 * 정해진 시간 내에 다음 버튼을 누르지 않을 경우
		 * 학습을 초기화 하는 타이머 컨트롤러
		 */
		function waitingTimeLogger () {
			
			timer_waiting_seconds -= 1;
			wait_message.html(' ( ' + timer_waiting_seconds + ' 초 이내 클릭 )');

			// 세션과 비디오 로그를 삭제한다.
			if (timer_waiting_seconds <= 0) {
				timer_wait.stop();
				alert('비디오를 재시청 해주시기 바랍니다.');

				axios.all([ deleteVideoLog(), deleteSessionLog() ])
				.then(axios.spread(function (res1, res2) {
					location.reload();
				}));
			}		  
		}		

		/**
		 * 세션 비디오 로그를 삭제한다.
		 */
		function deleteVideoLog () {

			return axios.delete('/video/log', {
				params: {
					video_id: video_id,
				}
			})
			.then(function (response) {
			})
			.catch(function (error) {
			console.error(error);
			});  	

		}

		// 세션 로그를 삭제한다.
		function deleteSessionLog () {

			return axios.delete('/session/log', {
				params: {
					training_user_id: training_user_id,
					course_list_id: course_list_id,
				}
			})
			.then(function (response) {
			})
			.catch(function (error) {
				console.error(error);
			});

		}			

		/**
		 * 다음버튼 클릭 시 발생 이벤트
		 */
		btn_play.on('click', function (event) {
			
			event.preventDefault();
			// 세션 종료로그를 기록한다.
			sessionProgressEndLogger();		

		});  

		/**
		 * Player 재생 시 발생
		 */
		player.on('play', function (data) {

			// 세션시작로그
			sessionProgressStartLogger();
			// 로깅 시간간격 설정
			timer_log.reset(1000 * timer_logging_interval);			

		});

		/**
		 * Player 일시정지 시 발생
		 */
		player.on('error', function (data) {

			console.error(data);

		});		

		/**
		 * Player 일시정지 시 발생
		 */
		player.on('pause', function (data) {

			// 로깅 일시정지
			timer_log.pause();
			// 비디오 시청 종료일시 기록
			videoEndTimeLogger();	

		});		

		/**
		 * Player 종료 시 발생
		 */
		player.on('ended', function (data) {

			// 로깅 일시정지
			timer_log.pause();
			// 총 시청시간에 따라 다음 버튼 표시
			showPlayBtn (video_total_played_seconds + timer_logging_interval);
			// 비디오 시청 종료일시 기록
			videoEndTimeLogger();
			// 세션 종료 시 대기 타이머 시작
			if (!session_has_ended) {
        setTimeout(function () {
          timer_wait = $.timer(1000 * 1, waitingTimeLogger, true);    
        }, 3000);        
      }

		});
    } 
    
    
);
