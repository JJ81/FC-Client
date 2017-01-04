
// 이달의 교육
SELECT DATE_FORMAT(e.`start_dt`, '%Y-%m-%d') AS `start_dt`
     , DATE_FORMAT(e.`end_dt`, '%Y-%m-%d') AS `end_dt`
	 , c.`name` AS course_name
     , c.`desc`
     , c.`thumbnail`
     , t.`name` AS teacher_name
  FROM `edu` AS e
 INNER JOIN `course_group` AS cg
    ON e.`course_group_id` = cg.`group_id` 
 INNER JOIN `course` AS c
    ON cg.`course_id` = c.`id`
 INNER JOIN `teacher` AS t
    ON c.`teacher_id` = t.`id`    
 WHERE NOW() BETWEEN e.`start_dt` AND e.`end_dt`;

// 이달의 교육2
SELECT DATE_FORMAT(e.`start_dt`, '%Y-%m-%d') AS `start_dt`
     , DATE_FORMAT(e.`end_dt`, '%Y-%m-%d') AS `end_dt`
	 , c.`name` AS course_name
     , c.`desc`
     , c.`thumbnail`
     , t.`name` AS teacher_name
  FROM `edu` AS e
 INNER JOIN `course_group` AS cg
    ON e.`course_group_id` = cg.`group_id` 
 INNER JOIN `course` AS c
    ON cg.`course_id` = c.`id`
 INNER JOIN `teacher` AS t
    ON c.`teacher_id` = t.`id`    
 WHERE NOW() BETWEEN e.`start_dt` AND e.`end_dt`
   AND e.id iN (
	   SELECT te.edu_id
		 FROM `users` AS u
		INNER JOIN `training_users` AS tu
		   ON u.`id` = tu.`user_id`
	    INNER JOIN `training_edu` AS te
           ON tu.`training_edu_id` = te.`id`
		  AND te.active = 1
		WHERE u.`id` = 2
	   );