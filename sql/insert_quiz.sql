
-- 퀴즈 입력
-- select * from quiz
insert into `quiz` (`type`, `question`) values ('QUIZ', '가맹점사업자가 가맹본부의 상표·서비스표·상호·간판 등의 영업표지를 사용할 수 있다.');
insert into `quiz` (`type`, `question`) values ('QUIZ', '경영이나 영업활동 등에 대해 가맹본부로부터 지원·교육과 통제를 받는 대가로 가맹금을 가맹본부에 지급해야 한다.');
insert into `quiz` (`type`, `question`) values ('QUIZ', '상표란 자기의 상품과 타인의 상품을 식별하기 위해 사용하는 표장을 말한다.');
insert into `quiz` (`type`, `question`) values ('QUIZ', '가맹사업(프랜차이즈)은 \'상호, 상표 등의 사용 허락에 따른 영업에 관한 행위\'로서 기본적 상행위의 일종');
insert into `quiz` (`type`, `question`) values ('QUIZ', '영업표지의 상표 등록 여부와 관계없이 제3자가 독립적으로 인식할 수 있을 정도면 가능하다.');
insert into `quiz` (`type`, `question`) values ('QUIZ', '가맹본부가 가맹점사업자의 주된 사업과 무관한 상품 등만 공급하는 경우에는 가맹사업이 아니다.');
insert into `quiz` (`type`, `question`) values ('QUIZ', '가맹본부의 영업방침을 따르지 않는 경우 아무런 불이익이 없다면 가맹사업이 아니다.');
insert into `quiz` (`type`, `question`) values ('QUIZ', '가맹본부가 가맹점사업자에게 도매가격 이상으로 물품을 공급하는 경우도 가맹금 지급에 해당한다.');
insert into `quiz` (`type`, `question`) values ('QUIZ', '일시적 지원만 하는 경우는 가맹사업이 아니다.');
insert into `quiz` (`type`, `question`) values ('QUIZ', '자기의 이름으로 물건을 판매하여 생기는 이익이나 손해는 다른 자에게 속하게 하고, 자신은 판매에 따른 일정한 수수료를 가지는 자를 무엇이라 하는가?');
insert into `quiz` (`type`, `question`) values ('QUIZ', '자기가 상거래를 하는 것이 아니라 다른 상인을 위하여 거래를 대리하거나 중개하는 방법으로 영업을 보조하는 사람을 무엇이라 하는가?');
insert into `quiz` (`type`, `question`) values ('QUIZ', '같은 업종의 여러 소매점포를 직영하거나 같은 업종의 여러 소매점포에 대하여 계속적으로 경영을 지도하고 상품·원재료 또는 용역을 공급하는 사업을 무엇이라 하는가?');
insert into `quiz` (`type`, `question`) values ('QUIZ', '가맹계약을 체결하기 위해서 가맹본부 또는 가맹지역본부와 상담하거나 협의하는 사람을 무엇이라 하는가?');
insert into `quiz` (`type`, `question`) values ('QUIZ', '가맹사업의 영업을 하기 위해서 가맹본부로부터 가맹점운영권을 부여받은 사업자를 무엇이라 하는가?');
insert into `quiz` (`type`, `question`) values ('QUIZ', '가맹점사업자에게 가맹점운영권을 부여하는 사업자를 무엇이라 하는가?');
insert into `quiz` (`type`, `question`) values ('QUIZ', '그 이름이나 지급의 형태가 어떻든 간에 가맹점사업자가 가맹본부에게 지급하는 다음의 대가를 무엇이라 하는가?');
insert into `quiz` (`type`, `question`) values ('QUIZ', '장애인기업에 해당할 경우 어떤 지원을 받을 수 있나요?');
insert into `quiz` (`type`, `question`) values ('QUIZ', '담보능력이 부족한 중소기업이 지원받을 수 있는 신용보증에는 무엇이 있나요?');
insert into `quiz` (`type`, `question`) values ('QUIZ', '중소기업의 기술개발을 위한 국가의 기술개발 지원사업에는 무엇이 있나요?');
insert into `quiz` (`type`, `question`) values ('QUIZ', '육아 문제로 전일제 근무가 어려운데요, 아르바이트 밖에 방법이 없을까요?');
insert into `quiz` (`type`, `question`) values ('QUIZ', '어머니가 아프셔서 가족돌봄을 위한 근로시간 단축 제도를 이용하고 있습니다. 저도 연차를 쓸 수 있나요?');

-- select * from quiz where id in (32,33,34)
-- select * from quiz where type = 'FINAL'
-- select * from quiz_option where opt_id = 'truefalse'
-- select * from quiz_group where group_id = '244b7eda1c1b50bd072df0ae5621824d'
-- select * from video
-- select * from course_list
-- select name, phone, email from users where fc_id = 1 order by branch_id, duty_id

-- select * from log_bind_users -- e6e729b89302c7b3350728f8aa90dd83
-- select * from log_group_user where group_id = 'e6e729b89302c7b3350728f8aa90dd83'
-- insert into log_group_user (group_id, user_id) select 'e6e729b89302c7b3350728f8aa90dd83', id from users where fc_id = 1 
-- select * from log_assign_edu 
-- select * from edu
-- select * from training_edu where edu_id in (24,25,27)
-- select * from training_users
-- insert into training_users (user_id, training_edu_id) select user_id, 18 from log_group_user where group_id = 'e6e729b89302c7b3350728f8aa90dd83'

-- select * from course_group where group_id = 'f1267050afe61a4f27f398828eef9123'
-- select * from course_group where group_id = 'e871d99b10928aa8b989895d705cc463'
-- select * from course_group where group_id = 'b82a76dfbf240b64438ed8f7de78c6e2'

SELECT cg.`group_id`, cg.`order`   
  FROM `training_users` AS tu  
 INNER JOIN `training_edu` AS te     
    ON tu.`training_edu_id` = te.id   
 INNER JOIN `edu` AS e     
    ON te.`edu_id` = e.`id`  
 INNER JOIN `course_group` AS cg     
    ON e.`course_group_id` = cg.`group_id`    
   AND cg.`course_id` = '9'  
 WHERE tu.`id` = '67';


select * from training_users where id = 98
select * from training_edu where id = 17
select * from edu where id = 25
select * from course_group where group_id = 'f1267050afe61a4f27f398828eef9123'
select * from course where id in (11, 12)
select * from course_list where id = 19
select * from quiz_group where group_id = 'ce5d0f7954a1da8b23905eaccad67b0d'
select * from quiz where id in (19,20)
select * from quiz_option where opt_id = 'truefalse'



