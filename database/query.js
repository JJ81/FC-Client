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
		' WHERE `phone` = ?; '
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
		'        SELECT IFNULL(ROUND(SUM(CASE WHEN ISNULL(up.`id`) THEN 0 ELSE 1 END) / COUNT(cl.`id`)), 0) AS done ' +
		'				   FROM `course_list` AS cl ' +
		'			     LEFT JOIN `log_session_progress` AS up ' +
		'						 ON cl.id = up.course_list_id ' +
    '     		  AND up.user_id = ? ' +
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
		' WHERE NOW() BETWEEN e.`start_dt` AND e.`end_dt` ' +
    ' ORDER BY completed_rate, cg.`order`; ',
  
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
		'        SELECT IFNULL(ROUND(SUM(CASE WHEN ISNULL(up.`id`) THEN 0 ELSE 1 END) / COUNT(cl.`id`)), 0) AS done ' +
		'				   FROM `course_list` AS cl ' +
		'			     LEFT JOIN `log_session_progress` AS up ' +
		'						 ON cl.id = up.course_list_id ' +
    '     		  AND up.user_id = ? ' +
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
    ' ORDER BY completed_rate, cg.`order`; ',
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
		'        SELECT IFNULL(ROUND(SUM(CASE WHEN ISNULL(up.`id`) THEN 0 ELSE 1 END) / COUNT(cl.`id`)), 0) ' +
		'				   FROM `course_list` AS cl ' +
		'			     LEFT JOIN `log_session_progress` AS up ' +
		'						 ON cl.id = up.course_list_id ' +
    ' 			    AND up.`training_user_id` = ? ' +
		' 			  WHERE cl.`course_id` = @course_id ' +
		'				) AS completed_rate ' +		
		' 	  , ( ' +
		'				 SELECT IFNULL(TRUNCATE(AVG(rate) / 5, 2) * 100, 0) ' +
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
    '   AND up.user_id = ? ' +
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
  // 만약 동시에 여러 교육과정이 배정된다면 다른 교육과정의 강의를 가져와야 한다면 ?
  SEL_NEXT_COURSE:
    'SELECT `course_id` ' +
    '  FROM `course_group` AS cg ' +
    ' WHERE cg.`id` = ( ' +
	  '   SELECT MIN(`id`) ' +
	  '     FROM `course_group` AS icg ' +
	  '    WHERE `group_id` = ? ' +
	  '      AND `order` > ? ' +
    '      AND NOT EXISTS (SELECT \'X\' FROM `log_course_progress` WHERE training_user_id = ? AND `end_dt` IS NOT NULL AND `course_id` = icg.`course_id`) ' +
    '  ); ',

  // 사용자별 강의 진행정보를 입력
  INS_COURSE_PROGRESS:
    'INSERT INTO `log_course_progress` (`user_id`, `training_user_id`, `course_id`) ' +
    'SELECT ?, ?, ? ' +
    '  FROM dual ' +
    ' WHERE NOT EXISTS (SELECT \'X\' FROM `log_course_progress` WHERE `training_user_id` = ? AND `course_id` = ?); ' 
       
};

// 세션정보
QUERY.COURSE_LIST = {

  // 세션목록
  SEL_INDEX: 
    'SELECT cl.`id` ' +
    '     , cl.`type` ' +
    '     , cl.`title` ' +
    '     , cl.`quiz_group_id` ' +
    '     , cl.`video_id` ' +
    '     , @course_id := cl.`course_id` AS course_id ' +
    '     , @order := cl.`order` AS `order` ' +
    '     , (SELECT MIN(`id`) FROM `course_list` WHERE `course_id` = @course_id AND `order` > @order) AS next_id ' +
    '  FROM `course_list` AS cl ' +
    ' WHERE cl.`id` = ? ' +
    ' ORDER BY cl.`order`; ',
  
  // 비디오 정보
  SEL_VIDEO: 
    'SELECT v.`id` ' +
    '	    , v.`name` ' +
    '     , v.`url` ' +
    '     , LOWER(v.`type`) AS video_type ' +     
    '     , SUBSTRING_INDEX(v.`url`, \'/\', -1) AS video_id ' +
    '  FROM `video` AS v ' +
    ' WHERE v.id = ?; ',
  
  // QUIZ / FINAL 정보
  SEL_QUIZ:
    'SELECT q.`id` ' +
    '      , q.`type` ' +
    '      , q.`question` ' +
    '      , IFNULL(q.`answer`, q.`answer_desc`) AS answer ' +
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
    
};

QUERY.LOG_COURSE_LIST = {

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
};

module.exports = QUERY;