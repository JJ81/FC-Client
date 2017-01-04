

/* express 설정 */
var express = require('express');
var router = express.Router();
/* DB 커넥션 객체 */
var mysql_dbc = require('../commons/db_conn')();
// DB 연결
var connection = mysql_dbc.init();
// DB 연결 테스트
mysql_dbc.test_open(connection);
// 쿼리 로드
var QUERY = require('../database/query');

// 프로젝트 속성
var PROJ_TITLE = "오렌지나무";

// 헬퍼 함수
require('../commons/helpers');

// 세션 플러그인
var flash = require('connect-flash');

// 암호화
var bcrypt = require('bcrypt');

// async
var async = require('async');

// passport (인증모듈) 설정
// 참고 : http://bcho.tistory.com/920
var passport = require('passport');
// passport local strategy (id, pwd 형)
var LocalStrategy = require('passport-local').Strategy;

// 로그인이 성공하면 사용자 정보를 Session 에 저장
passport.serializeUser(function (user, done) {
  done(null, user);
});

// 로그인이 되어있는 상태에서, 모든 사용자 페이지 접근 시 발생
// 세션에서 사용자 profile 을 찾은 후 HTTP Request 로 리턴
passport.deserializeUser(function (user, done) {
  done(null, user);
});

// 사용자 로그인 여부 확인
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();

  // 로그인되어 있지 않을 경우 로그인 페이지로 이동
  res.redirect('/login');
};

// Local Strategy 에 의해 인증시 호출되는 인증 메서드 정의
passport.use(new LocalStrategy({
    usernameField: 'phone',
    passwordField: 'password',
    passReqToCallback: true
  }, function (req, phone, password, done) {
    connection.query(QUERY.AUTH.INFO, [phone], function (err, data) {
      if (err) {
        return done(null, false);
      } else {
        if (data.length === 1) {
          if (!bcrypt.compareSync(password, data[0].password)) {
            console.log('password is not matched.');
            return done(null, false);
          } else {
            console.log('password is matched.');
            return done(null, {
              'user_id': data[0].id,
              'fc_id': data[0].fc_id, 
              'name' : data[0].name,
              'email' : data[0].email
            });
          }
        } else {
          return done(null, false);
        }
      }
    });
  }
));

// 로그인 화면
router.get('/login', function (req, res) {
  if (req.user == null) {
    res.render('login', {
      current_path: 'login',
      title: PROJ_TITLE      
    });
  } else {
    res.redirect('/edulist');
  }
});

// 로그인 처리
router.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }), function (req, res) {
    res.redirect('/edulist');
  });

// 로그아웃
router.get('/logout', isAuthenticated, function (req, res) {
  req.logout();
  res.redirect('/');
});

// 로그인 상태일 경우, 이달의 교육과정 메뉴로 이동
router.get('/', isAuthenticated, function (req, res) {
  res.redirect('/edulist');
});

// 이달의/지난 교육과정
router.get('/edu(old)?list', isAuthenticated, function(req, res){

  // 이달/지난 교육의 경로를 세션에 저장한다.
  req.user.root_path = req.path;

  console.log(req.user.root_path); 

	// req.url 에 따라 쿼리문을 달리한다.
  var query = null,
      // 사용자 교육 배정 id
      training_user_id = null,
      // 강의 목록 
      course_list = null,
      // 완료/미완료 order (정렬순서) 가장 낮은 강의의 id
      next_course_id = null,
      // 완료한 강의의 수
      count_course_done = 0,
      // 루프
      i,
      // 강의 개수
      courses_length; 

  if (req.url === '/edulist') {
    query = QUERY.EDU.CURRENT;
    header = '이달의 교육과정';
  } else if (req.url === '/eduoldlist') {
    query = QUERY.EDU.PASSED;
    header = '지난 교육과정';
  }

	connection.query(query, [req.user.user_id, req.user.user_id], function (err, data) {

		if (err) {
			// 쿼리 실패시
			console.error(err);
		} else {     
			//console.log(data);
      courses = data;
      courses_length = courses.length;
      training_user_id = courses[0].training_user_id;

      // 학습하기 버튼 클릭 시 시작 세션 id를 구한다.
      // 기본은 id 가 가장 작은 세션이다.
      // 그 다음은 완료하지 않은 세션 중 id 가 가장 작은 세션이다. 
      if (courses_length !== 0) {
        next_course_id = courses[0].course_id;
        for (i = 0; i < courses_length; i++) {
          if (courses[i].completed_rate !== 100) {
            next_course_id = courses[i].course_id;
            break;
          }
        }
      }

      // 완료하지 않은 강의의 수
      for (i = 0; i < courses_length; i++) {
        if (courses[i].completed_rate === 100) {
          count_course_done += 1;
        }
      }

			// 쿼리 성공시
			res.render('edulist', {
				current_path: 'edulist',
        current_url: req.url,
				title: PROJ_TITLE,
				req: req.get('origin'),
				loggedIn: req.user,        
				header: header,
				courses: data,
        next_course_id: next_course_id,
        training_user_id: training_user_id,
        count_course_done: count_course_done
			});
		}
	});
});

// 이달의 교육과정의 특정 강의 페이지
router.get('/edu(old)?list/:training_user_id/:course_id', isAuthenticated, function (req, res) {		
    
  //TODO
  // 1. 마지막 course_list_id 를 조회한다.
  //    아무진행도 하지 않은 경우 course_list 의 첫번째 id 를 가져온다.
  //    알부 진행한 경우 log_edu_user_progress 에 없는 id 중 course_list 에서 order 가 가장 낮은 id 를 가져온다.

	var course_id = req.params.course_id,
      // 학습을 시작/반복/이어할 세션 id
      min_course_list_id = null;
		
		async.series([
			function (callback) {				
				connection.query(QUERY.COURSE.INDEX, [course_id], function (err, data) {
					callback(err, data[0]); // results[0]
				});
			},
			function (callback) {
				connection.query(QUERY.COURSE.SESSION_LIST, [req.user.user_id, course_id], function (err, data) {
					callback(err, data); // results[1]
				});
			}
		], function (err, results) {
			if (err) {
				console.error(err);
			} else {
				console.info(results);

        // 학습하기 버튼 클릭 시 시작 세션 id를 구한다.
        // 기본은 id 가 가장 작은 세션이다.
        // 그 다음은 완료하지 않은 세션 중 id 가 가장 작은 세션이다. 
        if (results[1].length !== 0) {
          min_course_list_id = results[1][0].id;
          for (var i = 0; i < results[1].length; i++) {
            if (results[1][i].done !== 1) {
              min_course_list_id = results[1][i].id;
              break;
            }
          }
        }						

				// 강의뷰 출력
				res.render('course', {
					current_path: 'course',
					current_url: req.url,
					title: PROJ_TITLE,
					host: req.get('origin'),
					loggedIn: req.user,
					header: results[0].course_name,
					course: results[0],
          course_list: results[1],
          course_list_id: min_course_list_id
				});									
			}
		});
});


// 학습하기
router.get('/edu(old)?list/:training_user_id/:course_id/:course_list_id', isAuthenticated, function (req, res) {

  // TODO
  // 1. 최초 학습시작 버튼 클릭시 training_users 의 start_dt 를 기록해야 한다.
  // 2. 비디오인지, 퀴즈인지, 테스트인지 구분할 수 있어야 한다. V
  // 3. 비디오일 경우 plyr 연결
  // 4. 로깅
  // 5. 정답체크는 서버에서 한 후 결과를 내려줘야 한다.
  // 6. 다음 세션id 를 가져와야 한다.

  var training_user_id = req.params.training_user_id,
      course_id = req.params.course_id, 
      course_list_id = req.params.course_list_id,
      course_list = null,
      session = null; // course_list 데이터 저장

  async.series([
    function (callback) {
      connection.query(QUERY.COURSE_LIST.INDEX, [course_list_id], function (err, data) {
        course_list = data[0];
        callback(err, data); // results[0]
      });
    },
    function (callback) {
      
      switch (course_list.type) {
        case 'VIDEO':
          connection.query(QUERY.COURSE_LIST.VIDEO, [course_list.video_id], function (err, data) {
            callback(err, data); // results[1]
          });          
          break;

        default: // QUIZ / FINAL
          connection.query(QUERY.COURSE_LIST.QUIZ, [course_list.quiz_group_id], function (err, data) {
            callback(err, data); // results[1]
          });
          break;
      }
    }
  ], function (err, results) {
    if (err) {
      console.error(err);
    } else {

      // 다음으로 버튼 클릭시 이동할 페이지
      var root_path = '/' + req.path.split("/")[1],
          next_url = null;

      if (course_list.next_id)
        next_url = req.url.substring(0, req.url.lastIndexOf("/") + 1) + course_list.next_id;
      else
        next_url = '/' + 'evaluate' + '/' + training_user_id + '/' + course_id; //root_path + 

      // console.log('next_url : ' + next_url);

      if (course_list.type === 'VIDEO') {
          // 비디오뷰 출력
          res.render('video', {
            current_path: 'video',
            current_url: req.url,
            title: PROJ_TITLE,
            host: req.get('origin'),
            loggedIn: req.user,
            header: course_list.title,
            course_list: results[1][0],
            next_url: next_url
          });
      }		        
      else {

          // 보기옵션명과, 보기옵션id 를 배열로 변환한다.
          var tmp = null;
          for (var i = 0; i < results[1].length; i++) {
            // quiz_options
            tmp = results[1][i].quiz_options;
            if (tmp)
              results[1][i].quiz_options = tmp.split(',');
            // quiz_option_ids
            tmp = results[1][i].quiz_option_ids;
            if (tmp)
              results[1][i].quiz_option_ids = JSON.parse('[' + tmp + ']');
          }

          // console.log(results[1]);

          // 퀴즈뷰 출력
          res.render('quiz', {
            current_path: 'quiz',
            current_url: req.url,
            title: PROJ_TITLE,
            host: req.get('origin'),
            loggedIn: req.user,
            header: course_list.title,
            course_list: results[1],
            next_url: next_url
          });
      }
    }
  });    
  
});

// 강의/강사 평가
router.get('/evaluate/:training_user_id/:course_id', isAuthenticated, function (req, res) {

  var training_user_id = req.params.training_user_id,
      course_id = req.params.course_id,
      root_path = '/' + req.path.split("/")[1],
      next_url = '/'+ 'complete' + '/' + training_user_id + '/' + course_id;

    // 퀴즈뷰 출력
    res.render('evaluate', {
      current_path: 'evaluate',
      current_url: req.url,
      title: PROJ_TITLE,
      host: req.get('origin'),
      loggedIn: req.user,
      header: '강의평가',
      next_url: next_url
    });
});

// 강의완료
router.get('/complete/:training_user_id/:course_id', isAuthenticated, function (req, res) {

  var training_user_id = req.params.training_user_id,
      course_id = req.params.course_id,
      course_group = null;
  
  // 다음 강의코드를 구한다.
  async.series([
    function (callback) {
      connection.query(QUERY.COURSE.COURSE_GROUP, [ course_id, training_user_id ], function (err, data) {
        course_group = data[0];
        callback(err, data); // results[0]
      });
    },
    function (callback) {
      connection.query(QUERY.COURSE.NEXT_COURSE, [ course_group.group_id, course_group.order, training_user_id ], function (err, data) {
        callback(err, data); // results[1]
      });
    }
  ], function (err, results) {
    if (err) {
      console.error(err);
    } else {
      console.info(results);

      var next_course = null;
      if (results[1])
        next_course = req.user.root_path + '/' + training_user_id + '/' + results[1][0].course_id;
      
      // 퀴즈뷰 출력
      res.render('complete', {
        current_path: 'complete',
        current_url: req.url,
        root_url: req.user.root_path,
        title: PROJ_TITLE,
        host: req.get('origin'),
        loggedIn: req.user,
        header: '강의완료',
        next_course: next_course
      });
    }
  });

});

module.exports = router;