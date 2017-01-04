SELECT DATE_FORMAT(e.`start_dt`, '%Y-%m-%d') AS `start_dt`
     , DATE_FORMAT(e.`end_dt`, '%Y-%m-%d') AS `end_dt`
     , @course_id := c.`id` AS course_id
     , @training_user_id := ut.training_user_id AS training_user_id
	 , c.`name` AS course_name
     , c.`desc`
     , c.`thumbnail`
     , t.`name` AS teacher_name
         , cg.`group_id`
         , cg.`order` AS group_order
     , @course_id:=c.id AS course_id
     -- 강의별 진행률
     , (
		SELECT IFNULL(ROUND(SUM(CASE WHEN ISNULL(up.`id`) THEN 0 ELSE 1 END) / COUNT(cl.`id`)), 0) AS done
		  FROM `course_list` AS cl
		  LEFT JOIN `log_edu_user_progress` AS up
			ON cl.id = up.course_list_id
		   AND up.user_id = 2
		 WHERE cl.`course_id` = @course_id
		) AS completed_rate
	 , (SELECT `end_dt` FROM `log_course_progress` WHERE `training_user_id` = @training_user_id AND `course_id` = @course_id) AS course_end_dt, (SELECT `end_dt` FROM `log_course_progress` WHERE `training_user_id` = @training_user_id WHERE `course_id` = @course_id) AS course_end_dt        
  FROM `edu` AS e
 INNER JOIN (
 	   SELECT te.`edu_id`
		 FROM `users` AS u
		INNER JOIN `training_users` AS tu
		   ON u.`id` = tu.`user_id`
	    INNER JOIN `training_edu` AS te
           ON tu.`training_edu_id` = te.`id`
		  AND te.active = 1
		WHERE u.`id` = 2
	   ) AS ut
    ON e.`id` = ut.`edu_id`
 INNER JOIN `course_group` AS cg
    ON e.`course_group_id` = cg.`group_id` 
 INNER JOIN `course` AS c
    ON cg.`course_id` = c.`id`
 INNER JOIN `teacher` AS t
    ON c.`teacher_id` = t.`id`    
 WHERE NOW() BETWEEN e.`start_dt` AND e.`end_dt`