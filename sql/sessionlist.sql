
-- 세션정보 조회
SELECT cl.`id`, cl.`type`
     , cl.`quiz_group_id`
     , cl.`video_id`
     , @course_id := cl.`course_id` AS course_id
     , @order := cl.`order` AS `order`     
     , (SELECT MIN(`id`) FROM `course_list` WHERE `course_id` = @course_id AND `order` > @order) AS next_id
  FROM `course_list` AS cl
 WHERE cl.`course_id` = 3
 ORDER BY cl.`order`;
 
 
-- 비디오 정보 조회
SELECT * FROM `video`;

SELECT v.`id`
	 , v.`name`
     , v.`url`
     , v.`type` AS video_type     
     , SUBSTRING_INDEX(v.`url`, '/', -1) AS video_id
  FROM `video` AS v
 WHERE v.id = 3;
 
 -- 퀴즈 정보 조회
 SELECT * FROM `quiz`;
 SELECT * FROM `quiz_option`;
 select * from course_list;
 
 SELECT q.`id`
      , q.`type`
      , q.`name`
      , q.`question`
      , IFNULL(q.`answer`, q.`answer_desc`) AS answer
      , @option_id :=q.`option_id` AS option_id
      , (
         SELECT GROUP_CONCAT(`option` ORDER BY `order` ASC)
		   FROM `quiz_option`
		  WHERE `opt_id` = @option_id
		  GROUP BY `opt_id`
		) AS quiz_options
      , (
         SELECT GROUP_CONCAT(`id` ORDER BY `order` ASC)
		   FROM `quiz_option`
		  WHERE `opt_id` = @option_id
		  GROUP BY `opt_id`
		) AS quiz_option_ids
   FROM `quiz` AS q
  INNER JOIN `quiz_group` AS qg
     ON q.`id` = qg.`quiz_id`
	AND qg.`group_id` = 'dee5d6cd23384cd773102890ff5fcadb' 
  WHERE 1=1
  
  
/*

-- select * from course
-- select * from course_list;
-- select * from quiz;
-- select * from quiz_option;
-- SELECT MD5('박석제7');  

insert into quiz_option (`opt_id`, `option`, `order`)
select 'ea0bc12bac83391118c5a489ffd3a1c1', '보쌈', 1 union all
select 'ea0bc12bac83391118c5a489ffd3a1c1', '순대', 2 union all
select 'ea0bc12bac83391118c5a489ffd3a1c1', '막걸리', 3 union all
select 'ea0bc12bac83391118c5a489ffd3a1c1', '김치', 4; 

insert into quiz (type, name, question, answer, answer_desc, option_id)

-- 다지선다형 (5)
select 'QUIZ', '초등학년퀴즈-006', '우리가 좋아하는 피자는 어느나라 음식일까요?', '7', NULL, '09dd14cbace219fc37491dede5e3bf40' UNION ALL -- 프랑스
select 'QUIZ', '초등학년퀴즈-007', '인천상륙작전하면 떠오르는 장군은?', '11', NULL, 'ca0c057c5d4d3d6b4b7cef55e9d0ec6a' UNION ALL
select 'QUIZ', '초등학년퀴즈-008', '인류 최초로 달에 발을 디뎠던 사름은?', '20', NULL, 'd45aa48963c13fada6df6b98a355c9d0' UNION ALL
select 'QUIZ', '초등학년퀴즈-009', '지구,달,태양이 일직선상에 놓이는 현상을 무엇이라 하는가?', '26', NULL, 'b1d7b60db21132ba43a4d4dff03241d3' UNION ALL
select 'QUIZ', '초등학년퀴즈-005', '우리나라가 남.북으로 갈라지게 된 전쟁은 무엇일까요?', '33', NULL, '02927e931ae00b76946bb1446d3efc24' UNION ALL
select 'QUIZ', '초등학년퀴즈-010', '우리 나라의 대표적인 발효 식품은?', '40, 41', NULL, 'ea0bc12bac83391118c5a489ffd3a1c1' 

-- 단답형 (5)
select 'QUIZ', '초등학년퀴즈-001', '러시아의 수도는?', '모스크바', NULL, NULL UNION ALL
select 'QUIZ', '초등학년퀴즈-002', '세계에서 가장 높은 산은?', '에베레스트', NULL, NULL UNION ALL
select 'QUIZ', '초등학년퀴즈-003', '인구가 가장 많은 대륙은?', '아시아', NULL, NULL UNION ALL
select 'QUIZ', '초등학년퀴즈-004', '우리나라 초대 대통령 이름은?', '이승만', NULL, NULL UNION ALL
select 'QUIZ', '초등학년퀴즈-005', '우리나라가 남.북으로 갈라지게 된 전쟁은 무엇일까요?', '6.25전', NULL, NULL


insert into quiz_group (`group_id`, `quiz_id`, `order`)
select 'dee5d6cd23384cd773102890ff5fcadb', 15, 4 union all
select 'dee5d6cd23384cd773102890ff5fcadb', 13, 2 union all
select 'dee5d6cd23384cd773102890ff5fcadb', 14, 3 
*/
  
-- 강의그룹
SELECT cg.`group_id`, cg.`order`
-- SELECT cg.*
  FROM `training_users` AS tu
 INNER JOIN `training_edu` AS te
    ON tu.`training_edu_id` = te.id   
 INNER JOIN `edu` AS e
    ON te.`edu_id` = e.`id`    
 INNER JOIN `course_group` AS cg
    ON e.`course_group_id` = cg.`group_id` 
   -- AND cg.`course_id` = 3
 WHERE tu.`id` = 3

-- 동일 그룹내 다음 강의 가져오기
-- SELECT * FROM log_course_progress
-- SELECT * FROM log_session_progress
SELECT `course_id`
  FROM `course_group` AS cg
 WHERE cg.`id` = (
	SELECT MIN(`id`)
    -- SELECT *
	  FROM `course_group` AS icg
	 WHERE `group_id` = 1
	   AND `order` > 1
       AND NOT EXISTS (SELECT 'X' FROM `log_course_progress` WHERE training_user_id = 3 AND `end_dt` IS NOT NULL AND `course_id` = icg.`course_id`)
   )
 
 

 