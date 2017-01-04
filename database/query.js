var QUERY = {};


QUERY.AUTH = {
	// 사용자 정보
  INFO: 
	  'SELECT `id`, `name`, `email`, `password` ' +  
	  '  FROM `users` ' +
		' WHERE `phone` = ?; '
};

QUERY.EDU = {
	CURRENT:
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

	PASSED: 
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
	INDEX:
		'SELECT @course_id:=c.`id` AS course_id ' +
		'     , c.`name` AS course_name ' +
		'     , c.`thumbnail` ' +
		'     , c.`desc` ' +
		'     , t.`name` AS teacher_name ' +
    ' 	  , ( ' +
		'        SELECT IFNULL(ROUND(SUM(CASE WHEN ISNULL(up.`id`) THEN 0 ELSE 1 END) / COUNT(cl.`id`)), 0) ' +
		'				   FROM `course_list` AS cl ' +
		'			     LEFT JOIN `log_session_progress` AS up ' +
		'						 ON cl.id = up.course_list_id ' +
		' 			  WHERE cl.`course_id` = @course_id ' +
		'				) AS completed_rate ' +		
		' 	  , ( ' +
		'				 SELECT IFNULL(TRUNCATE(AVG(rate) / 5, 2) * 100, 0) ' +
  	'  				 FROM `user_rating` AS ur ' +
 	  ' 			  WHERE ur.`course_id` = @course_id ' +
		'				) AS course_rate ' +				
		'  FROM `course` AS c ' +
		' INNER JOIN `teacher` AS t ' +
		'    ON c.`teacher_id` = t.`id` ' +
		' WHERE c.id = ? ',
	
	// 강의 세션 목록
	SESSION_LIST: 
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
  COURSE_GROUP:
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
  NEXT_COURSE:
    'SELECT `course_id` ' +
    '  FROM `course_group` AS cg ' +
    ' WHERE cg.`id` = ( ' +
	  '   SELECT MIN(`id`) ' +
	  '     FROM `course_group` AS icg ' +
	  '    WHERE `group_id` = ? ' +
	  '      AND `order` > ? ' +
    '      AND NOT EXISTS (SELECT \'X\' FROM `log_course_progress` WHERE training_user_id = ? AND `end_dt` IS NOT NULL AND `course_id` = icg.`course_id`) ' +
    '  ); '
};

// 세션정보
QUERY.COURSE_LIST = {

  // 세션목록
  INDEX: 
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
  VIDEO: 
    'SELECT v.`id` ' +
    '	    , v.`name` ' +
    '     , v.`url` ' +
    '     , LOWER(v.`type`) AS video_type ' +     
    '     , SUBSTRING_INDEX(v.`url`, \'/\', -1) AS video_id ' +
    '  FROM `video` AS v ' +
    ' WHERE v.id = ?; ',
  
  // QUIZ / FINAL 정보
  QUIZ:
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
    '	   AND qg.`group_id` = ?; '
};

module.exports = QUERY;