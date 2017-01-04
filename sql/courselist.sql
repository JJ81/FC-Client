
-- 강의정보 조회
SELECT c.`name` AS course_name
     , t.`name` AS teacher_name
  FROM `course` AS c
 INNER JOIN `teacher` AS t
    ON c.`teacher_id` = t.`id`
 WHERE c.id = 3
 
 -- 강의평가 정보 조회
 /*
 SELECT * FROM `video`;
 INSERT INTO `video` (`name`,`type`,`url`,`creator_id`,`created_dt`,`updated_dt`,`active`) 
 SELECT 'Javascript Tutorial', 'YOUTUBE', 'https://youtu.be/fju9ii8YsGs', 2, NOW(), NULL, 1

 SELECT * FROM `quiz`;
 INSERT INTO `quiz` (`type`,`name`, `question`, `answer`, `option_id`)
 SELECT 'QUIZ', '초급-01', '자바스크립트는 재미있다.', '1', 3 
 
 
 SELECT * FROM `quiz_option`;
 INSERT INTO `quiz_option` (`opt_id`, `option`, `order`)
 SELECT 'jstutorial', '그렇다', 1 UNION ALL
 SELECT 'jstutorial', '아니다', 2 UNION ALL
 SELECT 'jstutorial', '잘 모르겠다', 3
 
 SELECT * FROM `course_list`;
 INSERT INTO `course_list` (`course_id`, `type`, `quiz_id`, `video_id`, `order`)
 SELECT 3, 'VIDEO', NULL, 3, 1 UNION ALL
 SELECT 3, 'QUIZ', 2, NULL, 2 UNION ALL
 SELECT 3, 'FINAL', 2, NULL, 3
 
 
 SELECT * FROM `user_rating`;
 INSERT INTO `user_rating` (`user_id`, `course_id`, `teacher_id`, `rate`, `created_dt`)
 SELECT 1, 3, 2, 2.5, NOW() UNION ALL
 SELECT 2, 3, 2, 3.0, NOW()
 
 
 */
 
 
 -- course_list 개수
 SELECT COUNT(*) AS cnt
   FROM `course_list`
  WHERE `course_id` = 3

-- log_edu_user_progress 개수
SELECT COUNT(*) AS cnt
  FROM `log_edu_user_progress` AS up
 WHERE up.`user_id` = 2
   AND up.`course_list_id` IN 
	   (
        SELECT `id`
          FROM `course_list`
		 WHERE `course_id` = 3
	   )
       
-- 강의 별평가 조회
SELECT ROUND(AVG(rate), 1) AS rate
  FROM `user_rating` AS ur
 WHERE ur.`course_id` = 3
 
-- course_list 조회
SELECT (CASE WHEN cl.`type` = 'VIDEO' THEN (SELECT name FROM `video` WHERE id = cl.video_id) ELSE cl.type END) AS title
     , (CASE WHEN ISNULL(up.id) THEN 0 ELSE 1 END) AS done
  FROM `course_list` AS cl
  LEFT JOIN `log_edu_user_progress` AS up
    ON cl.id = up.course_list_id
   AND up.user_id = 2
 WHERE cl.`course_id` = 3
 
-- 강의 진행률 계산
SELECT ROUND(SUM(CASE WHEN ISNULL(up.`id`) THEN 0 ELSE 1 END) / COUNT(cl.`id`)) AS done
  FROM `course_list` AS cl
  LEFT JOIN `log_edu_user_progress` AS up
    ON cl.id = up.course_list_id
   AND up.user_id = 2
 WHERE cl.`course_id` = 3 
  
  
 
 
