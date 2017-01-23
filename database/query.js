var QUERY = {};

/**
 * 쿼리를 정의한다.
 * 오류메세지 종류 :
 * SQLSTATE[42000]: Syntax error or access violation: 1064
 */
QUERY.AUTH = {

	// 사용자 정보
  SEL_INFO: 
	  'SELECT `id`, `name`, `email`, `password` ' +  
	  '  FROM `users` ' +
		' WHERE `phone` = ?; ',

  // 비밀번호 변경
  UPD_CHANGE_PWD: 
    'UPDATE `users` SET ' +
    '       `password` = ? ' +
    ' WHERE `id` = ?; ',

  // 이메일 변경
  UPD_CHANGE_EMAIL: 
    'UPDATE `users` SET ' +
    '       `email` = ? ' +
    ' WHERE `id` = ?; ', 

  // 핸드폰 변경
  UPD_CHANGE_PHONE: 
    'UPDATE `users` SET ' +
    '       `phone` = ? ' +
    ' WHERE `id` = ?; ',       
};

QUERY.EDU = {

  // 이달의 교육과정
	SEL_CURRENT:
		'SELECT DATE_FORMAT(e.`start_dt`, \'%Y-%m-%d\') AS `start_dt` ' +
		'     , DATE_FORMAT(e.`end_dt`, \'%Y-%m-%d\') AS `end_dt` ' +
    '     , cg.`group_id` AS course_group_id ' + 
    '     , cg.`order` AS course_group_order ' + 
		'     , @course_id := c.`id` AS course_id ' +
    '     , @training_user_id := ut.training_user_id AS training_user_id ' +
		'     , c.`name` AS course_name ' +
		'     , c.`desc` ' +
		'     , c.`thumbnail` ' +
		'     , t.`name` AS teacher_name ' +
    ' 	  , ( ' +
		'        SELECT IFNULL(TRUNCATE(SUM(CASE WHEN ISNULL(up.`id`) THEN 0 ELSE 1 END) / COUNT(cl.`id`), 2) * 100, 0) ' +
		'				   FROM `course_list` AS cl ' +
		'			     LEFT JOIN `log_session_progress` AS up ' +
		'						 ON cl.id = up.course_list_id ' +
    ' 			    AND up.`training_user_id` = @training_user_id ' +
    ' 			    AND up.`end_dt` IS NOT NULL ' +
		' 			  WHERE cl.`course_id` = @course_id ' +
		'				) AS completed_rate ' +
    '     , (SELECT `end_dt` FROM `log_course_progress` WHERE `training_user_id` = @training_user_id AND `course_id` = @course_id) AS course_end_dt ' +
    '     , e.name AS edu_name ' +
		'  FROM `edu` AS e ' +
 		' INNER JOIN ( ' +
		' 	    SELECT te.`edu_id`, tu.id AS training_user_id ' +
    '         FROM `users` AS u ' +
		'        INNER JOIN `training_users` AS tu ' +
		'           ON u.`id` = tu.`user_id` ' +
	  '        INNER JOIN `training_edu` AS te ' +
    '           ON tu.`training_edu_id` = te.`id` ' +
    '     		 AND te.active = 1 ' +
		'        WHERE u.`id` = ? ' +
	  '       ) AS ut ' +
    '    ON e.`id` = ut.`edu_id` ' +    
		' INNER JOIN `course_group` AS cg ' +
		'    ON e.`course_group_id` = cg.`group_id` ' + 
		' INNER JOIN `course` AS c ' +
		'    ON cg.`course_id` = c.`id` ' +
		' INNER JOIN `teacher` AS t ' +
		'    ON c.`teacher_id` = t.`id` ' +    
		' WHERE NOW() BETWEEN e.`start_dt` AND e.`end_dt` ' +
    ' ORDER BY completed_rate, e.id, cg.`order`; ',
  
  // 지난 교육과정
	SEL_PASSED: 
		'SELECT DATE_FORMAT(e.`start_dt`, \'%Y-%m-%d\') AS `start_dt` ' +
		'     , DATE_FORMAT(e.`end_dt`, \'%Y-%m-%d\') AS `end_dt` ' +
    '     , cg.`group_id` AS course_group_id ' + 
    '     , cg.`order` AS course_group_order ' +    
		'     , @course_id := c.`id` AS course_id ' +
    '     , @training_user_id := ut.training_user_id AS training_user_id ' +
		'     , c.`name` AS course_name ' +
		'     , c.`desc` ' +
		'     , c.`thumbnail` ' +
		'     , t.`name` AS teacher_name ' +
    ' 	  , ( ' +
		'        SELECT IFNULL(TRUNCATE(SUM(CASE WHEN ISNULL(up.`id`) THEN 0 ELSE 1 END) / COUNT(cl.`id`), 2) * 100, 0) ' +
		'				   FROM `course_list` AS cl ' +
		'			     LEFT JOIN `log_session_progress` AS up ' +
		'						 ON cl.id = up.course_list_id ' +
    ' 			    AND up.`training_user_id` = @training_user_id ' +
    ' 			    AND up.`end_dt` IS NOT NULL ' +    
		' 			  WHERE cl.`course_id` = @course_id ' +
		'				) AS completed_rate ' +
    '     , (SELECT `end_dt` FROM `log_course_progress` WHERE `training_user_id` = @training_user_id AND `course_id` = @course_id) AS course_end_dt ' +
		'  FROM `edu` AS e ' +
 		' INNER JOIN ( ' +
		' 	    SELECT te.`edu_id`, tu.id AS training_user_id ' +
    '         FROM `users` AS u ' +
		'        INNER JOIN `training_users` AS tu ' +
		'           ON u.`id` = tu.`user_id` ' +
	  '        INNER JOIN `training_edu` AS te ' +
    '           ON tu.`training_edu_id` = te.`id` ' +
    '     		 AND te.active = 1 ' +
		'        WHERE u.`id` = ? ' +
	  '       ) AS ut ' +
    '    ON e.`id` = ut.`edu_id` ' +        
		' INNER JOIN `course_group` AS cg ' +
		'    ON e.`course_group_id` = cg.`group_id` ' + 
		' INNER JOIN `course` AS c ' +
		'    ON cg.`course_id` = c.`id` ' +
		' INNER JOIN `teacher` AS t ' +
		'    ON c.`teacher_id` = t.`id` ' +    
		' WHERE NOW() > e.`end_dt` ' +
    ' ORDER BY completed_rate, e.id, cg.`order`; ',
  
  // 최초 학습시작 시 training_users 의 시작일시(start_dt)를 기록하여야 한다.
  UPD_TRAINING_USER_START_DT: 
    'UPDATE `training_users` SET ' +
    '       `start_dt` = NOW() ' +
    ' WHERE `id` = ? ' +
    '   AND `start_dt` IS NULL; ',

  // 최초 학습완료 시 training_users INSERT 및 종료일시(end_dt)를 기록하여야 한다.
  // (단, 종료일시가 NULL 일 경우에만)
  UPD_TRAINING_USER_END_DT: 
    'UPDATE `training_users` SET ' +
    '       `end_dt` = NOW() ' +
    ' WHERE `id` = ? ' +
    '   AND `end_dt` IS NULL; '
};

QUERY.COURSE = {
	
	// 강의 정보 조회
	SEL_INDEX:
		'SELECT @course_id := c.`id` AS course_id ' +
		'     , c.`name` AS course_name ' +
		'     , c.`thumbnail` ' +
		'     , c.`desc` ' +
		'     , t.`name` AS teacher_name ' +
    ' 	  , ( ' +
		'        SELECT IFNULL(TRUNCATE(SUM(CASE WHEN ISNULL(up.`id`) THEN 0 ELSE 1 END) / COUNT(cl.`id`), 2) * 100, 0) ' +
		'				   FROM `course_list` AS cl ' +
		'			     LEFT JOIN `log_session_progress` AS up ' +
		'						 ON cl.id = up.course_list_id ' +
    ' 			    AND up.`training_user_id` = ? ' +
    ' 			    AND up.`end_dt` IS NOT NULL ' +
		' 			  WHERE cl.`course_id` = @course_id ' +    
		'				) AS completed_rate ' +		
		' 	  , ( ' +
		'				 SELECT IFNULL(TRUNCATE(AVG(course_rate) / 5, 2) * 100, 0) ' +
  	'  				 FROM `user_rating` AS ur ' +
 	  ' 			  WHERE ur.`course_id` = @course_id ' +
		'				) AS course_rate ' +	
    '     , (SELECT `end_dt` FROM `log_course_progress` WHERE `training_user_id` = ? AND `course_id` = @course_id) AS course_end_dt ' +			
		'  FROM `course` AS c ' +
		' INNER JOIN `teacher` AS t ' +
		'    ON c.`teacher_id` = t.`id` ' +
		' WHERE c.id = ? ',
	
	// 강의 세션 목록
	SEL_SESSION_LIST: 
    'SELECT cl.`id` ' +
    '     , cl.title ' +
		//'			, (CASE WHEN cl.`type` = \'VIDEO\' THEN (SELECT name FROM `video` WHERE id = cl.video_id) ELSE cl.type END) AS title ' +
		'		  , cl.type ' +
    '     , (CASE WHEN ISNULL(up.id) THEN 0 ELSE 1 END) AS done ' +
    '  FROM `course_list` AS cl ' +
    '  LEFT JOIN `log_session_progress` AS up ' +
    '    ON cl.id = up.course_list_id ' +
    '   AND up.training_user_id = ? ' +
    '   AND up.end_dt IS NOT NULL ' +
    ' WHERE cl.`course_id` = ? ' +
    ' ORDER BY cl.order; ',

  // 강의그룹
  SEL_COURSE_GROUP:
    'SELECT cg.`group_id`, cg.`order` ' +
    '  FROM `training_users` AS tu ' +
    ' INNER JOIN `training_edu` AS te ' +
    '    ON tu.`training_edu_id` = te.id  ' +  
    ' INNER JOIN `edu` AS e ' +
    '    ON te.`edu_id` = e.`id` ' +    
    ' INNER JOIN `course_group` AS cg ' +
    '    ON e.`course_group_id` = cg.`group_id` ' + 
    '   AND cg.`course_id` = ? ' +
    ' WHERE tu.`id` = ?; ',
  
  // 동일 강의그룹내 다음 강의를 가져온다.
  // todo 
  // 반복하기가 아닐 경우 미완료 강의중 다음강의를 가져와야 한다.
  // 반복하기일 경우 완료된 강의중 다음 강의를 가져와야 한다.
  // 만약 동시에 여러 교육과정이 배정된다면 다른 교육과정의 강의를 가져와야 한다면 ?
  SEL_NEXT_COURSE:
    'SELECT cg.`course_id` ' +
    '  FROM `course_group` AS cg ' +
    ' WHERE cg.`id` = ( ' +
	  '   SELECT `id` ' +
	  '     FROM `course_group` AS icg ' +
	  '    WHERE `group_id` = ? ' +
    '      AND `course_id` <> ? ' +
	  '      AND `order` >= ? ' +    
    '      AND NOT EXISTS (SELECT \'X\' FROM `log_course_progress` WHERE training_user_id = ? AND `end_dt` IS NOT NULL AND `course_id` = icg.`course_id`) ' +
    '    ORDER BY `order`, `id` LIMIT 1 ' +
    '  ); ',
  
  // 반복하기일 경우 다음 강의
  SEL_NEXT_COURSE_2:
    'SELECT cg.`course_id` ' +
    '  FROM `course_group` AS cg ' +
    ' WHERE cg.`id` = ( ' +
	  '   SELECT `id` ' +
	  '     FROM `course_group` AS icg ' +
	  '    WHERE `group_id` = ? ' +
    '      AND `course_id` <> ? ' +
	  '      AND `order` >= ? ' +
    '    ORDER BY `order`, `id` LIMIT 1 ' + 
    '  ); ',
  
  // 모든 강의 종료여부
  SEL_COURSE_END:
    ' SELECT cg.`id`  ' +
    '   FROM `course_group` AS cg ' +
    '  WHERE `group_id` = ? ' +
    '    AND EXISTS ( ' +
		'	          SELECT \'X\' ' + 
		'	            FROM `log_course_progress` ' +
		'	           WHERE `training_user_id` = ? ' +
    '              AND `course_id` = cg.`course_id` ' +
		'         	   AND `end_dt` IS NULL ' +
		'        ); ',

  // 사용자별 강의 진행정보를 입력
  INS_COURSE_PROGRESS:
    'INSERT INTO `log_course_progress` (`user_id`, `training_user_id`, `course_id`) ' +
    'SELECT ?, ?, ? ' +
    '  FROM dual ' +
    ' WHERE NOT EXISTS (SELECT \'X\' FROM `log_course_progress` WHERE `training_user_id` = ? AND `course_id` = ?); ',
  
  // 강의 종료일시 기록
  UPD_COURSE_PROGRESS:
    'UPDATE `log_course_progress` SET ' +
    '       `end_dt` = NOW() ' +
    ' WHERE `training_user_id` = ? ' + 
    '   AND `course_id` = ? ' +
    '   AND `end_dt` IS NULL; ',

  // 사용자별 강의 진행정보를 입력
  // 중복 평가는 일단 불가하도록
  // params : user_id, course_rate, teacher_rate, course_id
  INS_EVALUATE:
    'INSERT INTO `user_rating` (`user_id`, `course_id`, `teacher_id`, `course_rate`, `teacher_rate`, `created_dt`) ' +
    'SELECT ? AS user_id ' +
	  '     , c.`id` AS course_id ' +
    '     , c.`teacher_id` ' +
    '     , ? AS course_rate ' +
    '     , ? AS teacher_rate ' +
    '     , NOW() AS created_dt ' +
    '  FROM `course` AS c ' +
    ' WHERE c.`id` = ? ' +
    '   AND NOT EXISTS (SELECT \'X\' FROM `user_rating` WHERE `user_id` = ? AND `course_id` = c.`id`); ',
  
  // 강의평가 존재여부 조회
  SEL_EVALUATE:
    'SELECT ur.`course_rate`, ur.`teacher_rate` ' + 
    '  FROM `user_rating` AS ur ' +
    ' WHERE ur.`user_id` = ? ' +
    '   AND ur.`course_id` = ?; '
};

// 세션정보
QUERY.COURSE_LIST = {

  // 세션목록
  SEL_INDEX: 
    'SELECT @id := cl.`id` AS id ' +
    '     , cl.`type` ' +
    '     , cl.`title` ' +
    '     , cl.`quiz_group_id` ' +
    '     , cl.`video_id` ' +
    '     , @course_id := cl.`course_id` AS course_id ' +
    '     , @order := cl.`order` AS `order` ' +
    '     , (SELECT `id` FROM `course_list` WHERE `course_id` = @course_id AND `id` <> @id AND `order` >= @order ORDER BY `order`, `id` LIMIT 1) AS next_id ' +
    '     , (SELECT CASE WHEN ISNULL(MAX(`id`)) THEN 0 ELSE 1 END FROM `log_session_progress` WHERE `training_user_id` = ? AND `course_list_id` = @id AND `end_dt` IS NOT NULL) AS prev_yn ' +
    '  FROM `course_list` AS cl ' +
    ' WHERE cl.`id` = ? ' +
    ' ORDER BY cl.`order`; ',
  
  // 비디오 정보
  SEL_VIDEO: 
    'SELECT v.`id` ' +
    '	    , v.`name` ' +
    '     , v.`url` ' +
    '     , LOWER(v.`type`) AS video_type ' +     
    // '     , SUBSTRING_INDEX(v.`url`, \'/\', -1) AS video_id ' +
    '  FROM `video` AS v ' +
    ' WHERE v.id = ?; ',
  
  // QUIZ / FINAL 정보
  // todo
  // 이미 푼 문제인지 여부를 로그로부터 가져온다. V
  // 클라이언트에서 정답체크 시 정답을 내려줘야한다.
  SEL_QUIZ:
    'SELECT @quiz_id := q.`id` AS id ' +
    '      , q.`type` ' +
    '      , q.`question` ' +
    // '      , IFNULL(q.`answer`, q.`answer_desc`) AS answer ' +
    '      , @option_id :=q.`option_id` AS option_id ' +
    '      , ( ' +
    '         SELECT GROUP_CONCAT(`option` ORDER BY `order` ASC) ' +
    '		        FROM `quiz_option` ' +
    '		       WHERE `opt_id` = @option_id ' +
    '		       GROUP BY `opt_id` ' +
    '		     ) AS quiz_options ' +
    '      , ( ' +
    '         SELECT GROUP_CONCAT(`id` ORDER BY `order` ASC) ' +
    '		        FROM `quiz_option` ' +
    '		       WHERE `opt_id` = @option_id ' +
    '		       GROUP BY `opt_id` ' +
    '		     ) AS quiz_option_ids ' +    
    '   FROM `quiz` AS q ' +
    '  INNER JOIN `quiz_group` AS qg ' +
    '     ON q.`id` = qg.`quiz_id` ' +
    '	   AND qg.`group_id` = ?; ',
  
  // 정답체크 시 퀴즈에 대한 정보를 가져온다.
  // 클라이언트에서 정답체크 시 이후에 제거해야한다.
  SEL_QUIZ_2:
    'SELECT q.`id` ' +
    '     , q.`question` ' +
    '     , q.`answer` ' +
    '     , q.`answer_desc` ' + 
    '  FROM `quiz` AS q ' + 
    ' WHERE q.`id` IN ?; ',
  
  // 보기를 조회한다. (쿼리결과예 : 보기1, 보기2)
  SEL_OPTION:
    'SELECT GROUP_CONCAT(qo.`option` ORDER BY qo.`order` ASC) AS correct_answer ' +
    '  FROM `quiz_option` AS qo ' +
    ' WHERE qo.`id` IN ? ' +
    ' GROUP BY qo.opt_id; ',
    
};

QUERY.LOG_COURSE_LIST = {

  // 특정의 종료시간(종료여부)을 조회한다. 
  SEL_SESSION_PROGRESS:
    'SELECT `end_dt` ' +
    '  FROM `log_session_progress` ' +
    ' WHERE `user_id` = ? ' +
    '   AND `training_user_id` = ?' +
    '   AND `course_list_id` = ?; ',

  // 세션 로그를 입력한다.
  // TODO
  // 여러건 입력이 가능한지?
  INS_SESSION_PROGRESS:
    'INSERT INTO `log_session_progress` (`user_id`, `training_user_id`, `course_id`, `course_list_id`, `start_dt`) ' +
    'SELECT ?, ?, ?, ?, NOW()' +
    '  FROM dual ' +
    ' WHERE NOT EXISTS (SELECT \'X\' FROM `log_session_progress` WHERE `user_id` = ? AND `training_user_id` = ? AND `course_list_id` = ?); ',

  UPD_SESSION_PROGRESS:
    'UPDATE `log_session_progress` SET ' +
    '       `end_dt` = NOW() ' +
    ' WHERE `user_id` = ? ' + 
    '   AND `training_user_id` = ? ' + 
    '   AND `course_list_id` = ?; ',
  
  // 세션 로그를 삭제한다.
  DEL_SESSION_PROGRESS:
    'DELETE FROM `log_session_progress` WHERE `user_id` = ? AND `training_user_id` = ? AND `course_list_id` = ?; ',    
};

// 로깅
QUERY.LOG_VIDEO = {

  // 비디오 로그 입력
  // play_dt 가 바뀌는 경우에만 입력한다.
  INS_VIDEO:
    'INSERT INTO `log_user_video` (`user_id`, `video_id`, `start_dt`, `play_dt`) ' +
    'SELECT ?, ?, NOW(), CURDATE() ' +
    '  FROM dual ' +
    ' WHERE NOT EXISTS (SELECT \'X\' FROM `log_user_video` WHERE `user_id` = ? AND `video_id` = ? AND play_dt = CURDATE()); ',

  // 동일 비디오의 마지막 로그 아이디를 구한다.
  SEL_MAXID:
    'SELECT MAX(`id`) AS id FROM `log_user_video` WHERE `user_id` = ? AND `video_id` = ? AND `play_dt` = CURDATE()',
  
  // 재생시간 갱신
  UPD_VIDEO_PLAYTIME:
    'UPDATE `log_user_video` SET ' +
    '       `play_seconds` = `play_seconds` + ? ' +
    ' WHERE `id` = ?; ',

  // 재생시간 획득
  SEL_TOTAL_VIDEO_PLAYTIME:
    'SELECT SUM(`play_seconds`) AS total_played_seconds ' +
    '  FROM `log_user_video` ' +
    ' WHERE `user_id` = ? ' +
    '   AND `video_id` = ?; ', 
  
  // 종료일시 갱신
  UPD_VIDEO_ENDTIME:
    'UPDATE `log_user_video` SET ' +
    '       `end_dt` = NOW() ' +
    ' WHERE `id` = ? ',

  // 비디오 로그 삭제
  DELETE_VIDEO_LOG:
    'DELETE FROM `log_user_video` WHERE `id` = ?; ',
};

// 로깅
QUERY.LOG_QUIZ = {

  // 퀴즈 로그 입력
  // 정답체크 시 계속 입력된다.
  INS_QUIZ:
    'INSERT INTO `log_user_quiz` (`user_id`, `quiz_id`, `answer`, `correction`, `created_dt`) ' +
    'SELECT ?, ?, ?, ?, NOW(); ',
    // '  FROM dual ' +
    // ' WHERE NOT EXISTS (SELECT \'X\' FROM `log_user_quiz` WHERE `user_id` = ? AND `quiz_id` = ?); ',

};

module.exports = QUERY;