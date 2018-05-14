let QUERY = {};

/**
 * 쿼리를 정의한다.
 * 오류메세지 종류 :
 * SQLSTATE[42000]: Syntax error or access violation: 1064
 */
QUERY.AUTH = {
  // 사용자 정보
  SEL_INFO:
    'SELECT u.`id`, u.`name`, u.`email`, u.`password`, u.`fc_id` ' +
    '     , f.`backoffice_url`, f.`mobile_url`, u.`active` ' +
    '     , b.name AS branch_name ' +
    '     , d.name AS duty_name ' +
    '     , u.terms_approved ' +
    '     , f.isdemo ' +
    '     , f.`active` as fc_active ' +
    '  FROM `users` AS u ' +
    ' INNER JOIN `fc` AS f ' +
    '    ON u.`fc_id` = f.`id` ' +
    ' INNER JOIN `branch` AS b ' +
    '    ON u.`branch_id` = b.`id` ' +
    ' INNER JOIN `duty` AS d ' +
    '    ON u.`duty_id` = d.`id` ' +
    ' WHERE u.`phone` = ? ' +
    '   AND u.`active` = 1; ',

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

  // 보안서약서 인증여부 갱신
  UPD_CHANGE_TERMS:
    'UPDATE `users` SET ' +
    '       `terms_approved` = ? ' +
    ' WHERE `id` = ?; '
};

QUERY.EDU = {

  // 이달의 교육과정
  SEL_CURRENT:
    'SELECT DATE_FORMAT(ut.`start_dt`, \'%Y-%m-%d\') AS `start_dt` ' +
    '     , DATE_FORMAT(ut.`end_dt`, \'%Y-%m-%d\') AS `end_dt` ' +
    '     , cg.`group_id` AS course_group_id ' +
    '     , cg.`order` AS course_group_order ' +
    '     , @course_id := c.`id` AS course_id ' +
    '     , @training_user_id := ut.training_user_id AS training_user_id ' +
    '     , c.`name` AS course_name ' +
    '     , c.`desc` ' +
    '     , c.`thumbnail` ' +
    '     , c.`teacher` AS teacher_name ' +
    '     , ( ' +
    '        SELECT IFNULL(TRUNCATE(SUM(CASE WHEN ISNULL(up.`id`) THEN 0 ELSE 1 END) / COUNT(cl.`id`), 2) * 100, 0) ' +
    '          FROM `course_list` AS cl ' +
    '          LEFT JOIN `log_session_progress` AS up ' +
    '            ON cl.id = up.course_list_id ' +
    '           AND up.`training_user_id` = @training_user_id ' +
    '           AND up.`end_dt` IS NOT NULL ' +
    '         WHERE cl.`course_id` = @course_id ' +
    '       ) AS completed_rate ' +
    '     , (SELECT `end_dt` FROM `log_course_progress` WHERE `training_user_id` = @training_user_id AND `course_id` = @course_id) AS course_end_dt ' +
    '     , e.name AS edu_name ' +
    '  FROM `edu` AS e ' +
    ' INNER JOIN ( ' +
    '       SELECT ut.`user_id`, ut.`edu_id` ' +
    '            , MAX(ut.`training_user_id`) AS training_user_id ' +
    '            , MAX(ut.`start_dt`) AS start_dt ' +
    '            , MAX(ut.`end_dt`) AS end_dt ' +
    '         FROM (' +
    '               SELECT tu.`user_id`, te.`edu_id`, tu.id AS training_user_id ' +
    '                    , lae.`start_dt`, lae.`end_dt` ' +
    '                 FROM `users` AS u ' +
    '                INNER JOIN `training_users` AS tu ' +
    '                   ON u.`id` = tu.`user_id` ' +
    '                INNER JOIN `training_edu` AS te ' +
    '                   ON tu.`training_edu_id` = te.`id` ' +
    '                  AND te.active = 1 ' +
    '                INNER JOIN `log_assign_edu` AS lae ' +
    '                   ON lae.`training_edu_id` = te.`id` ' +
    '                  AND lae.`active` = 1 ' +
    '                WHERE u.`id` = ? ' +
    '               ) AS ut ' +
    '         GROUP BY ut.`user_id`, ut.`edu_id` ' +
    '       ) AS ut ' +
    '    ON e.`id` = ut.`edu_id` ' +
    ' INNER JOIN `course_group` AS cg ' +
    '    ON e.`course_group_id` = cg.`group_id` ' +
    ' INNER JOIN `course` AS c ' +
    '    ON cg.`course_id` = c.`id` ' +
    // ' INNER JOIN `teacher` AS t ' +
    // '    ON c.`teacher_id` = t.`id` ' +
    ' WHERE NOW() BETWEEN ut.`start_dt` AND ut.`end_dt` ' +
    // ' WHERE NOW() BETWEEN e.`start_dt` AND e.`end_dt` ' +
    ' ORDER BY completed_rate, e.id, cg.`order`; ',

  // 지난 교육과정
  SEL_PASSED: (searchBy, searchText, page = 1, count = 10) => {
    // //console.log(searchBy, searchText);
    let sql =
    'SELECT SQL_CALC_FOUND_ROWS DATE_FORMAT(ut.`start_dt`, \'%Y-%m-%d\') AS `start_dt` ' +
    '     , DATE_FORMAT(ut.`end_dt`, \'%Y-%m-%d\') AS `end_dt` ' +
    '     , cg.`group_id` AS course_group_id ' +
    '     , cg.`order` AS course_group_order ' +
    '     , @course_id := c.`id` AS course_id ' +
    '     , @training_user_id := ut.training_user_id AS training_user_id ' +
    '     , c.`name` AS course_name ' +
    '     , c.`desc` ' +
    '     , c.`thumbnail` ' +
    '     , c.`teacher` AS teacher_name ' +
    '     , ( ' +
    '        SELECT IFNULL(TRUNCATE(SUM(CASE WHEN ISNULL(up.`id`) THEN 0 ELSE 1 END) / COUNT(cl.`id`), 2) * 100, 0) ' +
    '         FROM `course_list` AS cl ' +
    '         LEFT JOIN `log_session_progress` AS up ' +
    '           ON cl.id = up.course_list_id ' +
    '           AND up.`training_user_id` = @training_user_id ' +
    '           AND up.`end_dt` IS NOT NULL ' +
    '         WHERE cl.`course_id` = @course_id ' +
    '      ) AS completed_rate ' +
    '     , (SELECT `end_dt` FROM `log_course_progress` WHERE `training_user_id` = @training_user_id AND `course_id` = @course_id) AS course_end_dt ' +
    '     , e.name AS edu_name ' +
    '     , e.can_replay ' +
    '  FROM `edu` AS e ' +
    ' INNER JOIN ( ' +
    '       SELECT te.`edu_id`, tu.id AS training_user_id ' +
    '            , lae.`start_dt`, lae.`end_dt` ' +
    '         FROM `users` AS u ' +
    '        INNER JOIN `training_users` AS tu ' +
    '           ON u.`id` = tu.`user_id` ' +
    '        INNER JOIN `training_edu` AS te ' +
    '           ON tu.`training_edu_id` = te.`id` ' +
    '        INNER JOIN `log_assign_edu` AS lae ' +
    '           ON lae.`training_edu_id` = te.`id` ' +
    '          AND te.active = 1 ' +
    '        WHERE u.`id` = ? ' +
    '       ) AS ut ' +
    '    ON e.`id` = ut.`edu_id` ' +
    ' INNER JOIN `course_group` AS cg ' +
    '    ON e.`course_group_id` = cg.`group_id` ' +
    ' INNER JOIN `course` AS c ' +
    '    ON cg.`course_id` = c.`id` ' +
    // ' INNER JOIN `teacher` AS t ' +
    // '    ON c.`teacher_id` = t.`id` ' +
    ' WHERE 1=1 ';
    // ' WHERE NOW() > ut.`end_dt` ';
    if (searchBy === 'course') {
      sql += 'AND CONCAT(e.`name`, c.`name`) LIKE \'%' + searchText + '%\'';
    } else if (searchBy === 'month') {
      sql += 'AND DATE_FORMAT(ut.`start_dt`, \'%Y-%m\') = \'' + searchText + '\'';
    }
    sql += ' ORDER BY ut.`start_dt` DESC, c.`name` ';
    sql += ' LIMIT ' + (page - 1) * count + ', ' + count + '; ';
    // sql += ' ORDER BY DATE_FORMAT(ut.`start_dt`, \'%Y-%m\') DESC, c.`name`; ';
    // sql += ' ORDER BY `end_dt` DESC, e.`id`, cg.`order`; ';

    return sql;
  },

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
    '   AND `end_dt` IS NULL; ',

  // edu_id, course_group_id 를 캐싱하기 위한 쿼리
  // @params : training_user_id,
  SEL_COURSE_GROUP:
    'SELECT te.`edu_id`, e.`course_group_id`, e.`name` AS edu_name ' +
    '     , e.`can_advance` ' +
    '     , IFNULL(DATE_FORMAT(tu.`start_dt`, \'%Y.%m.%d\'), \'\') AS start_dt ' +
    '     , IFNULL(DATE_FORMAT(tu.`end_dt`, \'%Y.%m.%d\'), \'\') AS end_dt ' +
    '  FROM `training_users` AS tu ' +
    ' INNER JOIN `training_edu` AS te ' +
    '    ON tu.`training_edu_id` = te.`id` ' +
    ' INNER JOIN `edu` AS e ' +
    '    ON te.`edu_id` = e.`id` ' +
    ' WHERE tu.`id` = ? ',

  // 지난 교육과정 검색 월
  SEL_PASSED_EDU_MONTH:
    'SELECT DATE_FORMAT(lae.`start_dt`, \'%Y-%m\') AS yearmonth ' +
    '  FROM `users` AS u ' +
    ' INNER JOIN `training_users` AS tu ' +
    '    ON u.`id` = tu.`user_id` ' +
    ' INNER JOIN `training_edu` AS te ' +
    '    ON tu.`training_edu_id` = te.`id` ' +
    ' INNER JOIN `log_assign_edu` AS lae ' +
    '    ON lae.`training_edu_id` = te.`id` ' +
    '   AND te.`active` = 1 ' +
    ' WHERE u.`id` = ? ' +
    // '   AND NOW() > lae.`end_dt` ' +
    ' GROUP BY yearmonth ' +
    ' ORDER BY yearmonth DESC '

};

QUERY.COURSE = {

  // 강의 정보 조회
  SEL_INDEX:
    'SELECT @course_id := c.`id` AS course_id ' +
    '     , c.`name` AS course_name ' +
    '     , c.`thumbnail` ' +
    '     , c.`desc` ' +
    '     , c.`teacher` AS teacher_name ' +
    '     , ( ' +
    '        SELECT IFNULL(TRUNCATE(SUM(CASE WHEN ISNULL(up.`id`) THEN 0 ELSE 1 END) / COUNT(cl.`id`), 2) * 100, 0) ' +
    '         FROM `course_list` AS cl ' +
    '         LEFT JOIN `log_session_progress` AS up ' +
    '           ON cl.id = up.course_list_id ' +
    '           AND up.`training_user_id` = ? ' +
    '           AND up.`end_dt` IS NOT NULL ' +
    '         WHERE cl.`course_id` = @course_id ' +
    '      ) AS completed_rate ' +
    '     , ( ' +
    '       SELECT IFNULL(TRUNCATE(AVG(course_rate) / 5, 2) * 100, 0) ' +
    '           FROM `user_rating` AS ur ' +
    '         WHERE ur.`course_id` = @course_id ' +
    '      ) AS course_rate ' +
    '     , (SELECT `end_dt` FROM `log_course_progress` WHERE `training_user_id` = ? AND `course_id` = @course_id) AS course_end_dt ' +
    '  FROM `course` AS c ' +
    // ' INNER JOIN `teacher` AS t ' +
    // '    ON c.`teacher_id` = t.`id` ' +
    ' WHERE c.id = ? ',

  // 강의 세션 목록
  SEL_SESSION_LIST:
    'SELECT cl.`id` ' +
    '     , cl.title ' +
    // '    , (CASE WHEN cl.`type` = \'VIDEO\' THEN (SELECT name FROM `video` WHERE id = cl.video_id) ELSE cl.type END) AS title ' +
    '    , cl.type ' +
    '     , (CASE WHEN ISNULL(up.id) THEN 0 ELSE 1 END) AS done ' +
    '  FROM `course_list` AS cl ' +
    '  LEFT JOIN `log_session_progress` AS up ' +
    '    ON cl.id = up.course_list_id ' +
    '   AND up.user_id = ? ' +
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
    '            SELECT \'X\' ' +
    '              FROM `log_course_progress` ' +
    '             WHERE `training_user_id` = ? ' +
    '              AND `course_id` = cg.`course_id` ' +
    '              AND `end_dt` IS NULL ' +
    '        ); ',

  // 모든 강의 반복여부
  SEL_COURSE_REPEAT_YN:
    ' SELECT cg.`id`  ' +
    '   FROM `course_group` AS cg ' +
    '  WHERE `group_id` = ? ' +
    '    AND EXISTS ( ' +
    '           SELECT \'X\' ' +
    '              FROM `log_course_progress` ' +
    '             WHERE `training_user_id` = ? ' +
    '              AND `course_id` = cg.`course_id` ' +
    '              AND `repeat_count` = 0 ' +
    '        ); ',

  // 사용자별 강의 진행정보를 입력
  INS_COURSE_PROGRESS:
    'INSERT INTO `log_course_progress` (`user_id`, `training_user_id`, `course_id`) ' +
    'SELECT ?, ?, ? ' +
    '  FROM dual ' +
    ' WHERE NOT EXISTS (SELECT \'X\' FROM `log_course_progress` WHERE `training_user_id` = ? AND `course_id` = ?); ',

  // 강의 반복횟수
  UPD_COURSE_PROGRESS_REPEAT:
    'UPDATE `log_course_progress` SET ' +
    '       `repeat_count` = `repeat_count` + 1 ' +
    ' WHERE `training_user_id` = ? ' +
    '   AND `course_id` = ? ' +
    '   AND `end_dt` IS NOT NULL; ',

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
    'INSERT INTO `user_rating` (`user_id`, `course_id`, `teacher_name`, `course_rate`, `teacher_rate`, `created_dt`) ' +
    'SELECT ? AS user_id ' +
    '     , c.`id` AS course_id ' +
    '     , c.`teacher` ' +
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
    '   AND ur.`course_id` = ?; ',

  GetPrevCourseId:
    'SELECT c.`name`, cg.`order` ' +
    '     , @seq := cg.`order` AS `seq` ' +
    '     , cg.`course_id` ' +
    '     , @group_id := cg.`group_id` AS group_id ' +
    '     , IFNULL((SELECT `course_id` FROM `course_group` WHERE `group_id` = @group_id AND `order` < @seq ORDER BY `order` DESC LIMIT 1),0) as prev_course_id ' +
    // '     , IFNULL((SELECT `course_id` FROM `course_group` WHERE `group_id` = @group_id AND `order` > @seq ORDER BY `order` LIMIT 1),0) as next_course_id ' +
    '  FROM `course_group` AS cg ' +
    ' INNER JOIN `course` AS c ' +
    '    ON cg.`course_id` = c.`id` ' +
    '   AND c.`id` = ? ' +
    ' WHERE cg.`group_id` = ? ' +
    ' ORDER BY cg.`order`; ',

  GetPrevCourseId2:
    'SELECT c.`name`, cg.`order` ' +
    '     , @id := cg.`id` AS id ' +
    '     , cg.`course_id` ' +
    '     , @course_id := cg.`course_id` AS course_id ' +
    '     , @group_id := cg.`group_id` AS group_id ' +
    '     , IFNULL((SELECT `course_id` FROM `course_group` WHERE `group_id` = @group_id AND `id` < @id ORDER BY `id` DESC LIMIT 1),0) as prev_course_id ' +
    // '     , IFNULL((SELECT `course_id` FROM `course_group` WHERE `group_id` = @group_id AND `order` > @seq ORDER BY `order` LIMIT 1),0) as next_course_id ' +
    '  FROM `course_group` AS cg ' +
    ' INNER JOIN `course` AS c ' +
    '    ON cg.`course_id` = c.`id` ' +
    '   AND c.`id` = ? ' +
    ' WHERE cg.`group_id` = ? ' +
    ' ORDER BY cg.`order`; ',

  GetCourseDone:
    'SELECT c.`name` AS course_name, lcp.`end_dt` ' +
    '  FROM `course` AS c ' +
    '  LEFT JOIN `log_course_progress` AS lcp ' +
    '    ON c.`id` = lcp.`course_id` ' +
    '   AND lcp.`training_user_id` = ? ' +
    ' WHERE c.`id` = ?; ',

  // 비디오를 ID로 조회한다.
  GetVideoDataById:
    'SELECT * FROM `video` WHERE id = ?;'
};

// 세션정보
QUERY.COURSE_LIST = {

  // 세션목록
  SEL_INDEX:
    'SELECT @id := cl.`id` AS id ' +
    '     , cl.`type` ' +
    '     , cl.`title` ' +
    '     , cl.`desc` ' +
    '     , cl.`quiz_group_id` ' +
    '     , cl.`checklist_group_id` ' +
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
    '     , v.`name` ' +
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
    '          FROM `quiz_option` ' +
    '         WHERE `opt_id` = @option_id ' +
    '         GROUP BY `opt_id` ' +
    '       ) AS quiz_options ' +
    '      , ( ' +
    '         SELECT GROUP_CONCAT(`id` ORDER BY `order` ASC) ' +
    '          FROM `quiz_option` ' +
    '         WHERE `opt_id` = @option_id ' +
    '         GROUP BY `opt_id` ' +
    '       ) AS quiz_option_ids ' +
    '   FROM `quiz` AS q ' +
    '  INNER JOIN `quiz_group` AS qg ' +
    '     ON q.`id` = qg.`quiz_id` ' +
    '     AND qg.`group_id` = ?; ',

  // 특정 세션의 그룹아이디로 퀴즈를 조회한다.
  GetQuizDataByGroupId:
    'SELECT q.`id` AS quiz_id ' +
    '     , q.`type` ' +
    '     , q.`quiz_type` AS quiz_type ' +
    '     , q.`question` ' +
    '     , q.`answer_desc` ' +
    '     , q.`answer_desc` ' +
    '     , qg.`order` AS quiz_order ' +
    '     , q.`option_id` as `option_group_id` ' +
    '     , qo.`id` as `option_id` ' +
    '     , qo.`option` ' +
    '     , qo.`order` AS option_order ' +
    '     , qo.`iscorrect`  ' +
    '  FROM `quiz_group` AS qg ' +
    ' INNER JOIN `quiz` AS q ' +
    '    ON qg.`quiz_id` = q.`id` ' +
    '  LEFT JOIN `quiz_option` AS qo ' +
    '    ON qo.`opt_id` = q.`option_id` ' +
    ' WHERE qg.`group_id` = ? ' +
    ' ORDER BY qg.`order`, qo.`order` ',

  // 특정 세션의 아이디로 체크리스트를 조회한다.
  GetChecklistByCourseListId:
    'SELECT c.`id` AS checklist_id ' +
    '     , c.`item_type` ' +
    '     , c.`item_name` ' +
    '     , c.`item_section` ' +
    '     , c.`sample` ' +
    '     , cg.`order` AS checklist_order ' +
    '     , cl.`title` ' +
    '  FROM `course_list` AS cl ' +
    ' INNER JOIN `checklist_group` AS cg ' +
    '    ON cl.`checklist_group_id` = cg.`group_id` ' +
    ' INNER JOIN `checklist` AS c ' +
    '    ON cg.`checklist_id` = c.`id` ' +
    ' WHERE cl.`id` = ?; ',

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
    ' GROUP BY qo.opt_id; '

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
    'VALUES(?, ?, ?, ?, NOW())' +
    '    ON DUPLICATE KEY UPDATE `start_dt` = NOW(); ',
    // 'SELECT ?, ?, ?, ?, NOW()' +
    // '  FROM dual ' +
    // ' WHERE NOT EXISTS (SELECT \'X\' FROM `log_session_progress` WHERE `user_id` = ? AND `training_user_id` = ? AND `course_list_id` = ?); ',

  UPD_SESSION_PROGRESS:
    'UPDATE `log_session_progress` SET ' +
    '       `end_dt` = NOW() ' +
    ' WHERE `user_id` = ? ' +
    '   AND `training_user_id` = ? ' +
    '   AND `course_list_id` = ?; ',

  // 세션 로그를 삭제한다.
  DEL_SESSION_PROGRESS:
    'DELETE FROM `log_session_progress` WHERE `user_id` = ? AND `training_user_id` = ? AND `course_list_id` = ?; ',
  // 세션 로그를 초기화 한다.
  INIT_SESSION_PROGRESS:
    'UPDATE `log_session_progress` SET ' +
    '       `start_dt` = NULL ' +
    '     , `end_dt` = NULL ' +
    '     , `refresh_count` = `refresh_count` + 1 ' +
    ' WHERE `user_id` = ? ' +
    '   AND `training_user_id` = ? ' +
    '   AND `course_list_id` = ?; '

};

// 로깅
QUERY.LOG_VIDEO = {

  // 비디오 로그 입력
  // play_dt 가 바뀌는 경우에만 입력한다.
  INS_VIDEO:
    'INSERT INTO `log_user_video` (`user_id`, `training_user_id`, `video_id`, `start_dt`, `play_dt`) ' +
    'SELECT ?, ?, ?, NOW(), CURDATE() ' +
    '  FROM dual ' +
    ' WHERE NOT EXISTS (SELECT \'X\' FROM `log_user_video` WHERE `training_user_id` = ? AND `video_id` = ? AND play_dt = CURDATE()); ',

  // 동일 비디오의 마지막 로그 아이디를 구한다.
  // AND `play_dt` = CURDATE() 조건은 제거하였다. 다음 날까지 걸쳐듣는 경우 이전 로그타임과 나누어며,
  // 이 경우 endtime 뿐 아니라, playtime 도 나누어야 하므로, 현재와 같이 변경한다.
  SEL_MAXID:
    'SELECT MAX(`id`) AS id FROM `log_user_video` WHERE `user_id` = ? AND `video_id` = ?',

  // 재생시간 갱신
  UPD_VIDEO_PLAYTIME:
    'UPDATE `log_user_video` SET ' +
    '       `play_seconds` = `play_seconds` + ? ' +
    '     , `duration` = ? ' +
    '     , `currenttime` = ? ' +
    ' WHERE `id` = ?; ',

  // 재생시간 갱신
  UPD_VIDEO_PLAYTIME2:
    'UPDATE `log_user_video` SET ' +
    '       `play_seconds` = ? ' +
    '     , `duration` = ? ' +
    '     , `currenttime` = ? ' +
    ' WHERE `id` = ?; ',

  // 재생시간 획득
  SEL_TOTAL_VIDEO_PLAYTIME:
    'SELECT SUM(`play_seconds`) AS total_played_seconds ' +
    '     , MAX(`duration`) AS max_duration ' +
    '  FROM `log_user_video` ' +
    ' WHERE `user_id` = ? ' +
    '   AND `training_user_id` = ? ' +
    '   AND `video_id` = ?; ',

  // 마지막 재생일시 획득
  SEL_LAST_VIDEO_CURRENT_TIME:
    'SELECT `currenttime` ' +
    '  FROM `log_user_video` ' +
    ' WHERE `user_id` = ? ' +
    '   AND `training_user_id` = ? ' +
    '   AND `video_id` = ? ' +
    ' ORDER BY `play_dt` DESC ' +
    ' LIMIT 1; ',

  // 종료일시 갱신
  UPD_VIDEO_ENDTIME:
    'UPDATE `log_user_video` SET ' +
    '       `end_dt` = NOW() ' +
    ' WHERE `id` = ? ',

  // 비디오 로그 삭제
  DELETE_VIDEO_LOG:
    'DELETE FROM `log_user_video` WHERE `id` = ?; '
};

// 로깅
QUERY.LOG_QUIZ = {

  // 퀴즈 로그 입력
  // 정답체크 시 계속 입력된다.
  INS_QUIZ:
    'INSERT INTO `log_user_quiz` (`user_id`, `training_user_id`, `course_id`, `course_list_type`, `quiz_id`, `answer`, `correction`, `created_dt`) ' +
    'VALUES (?, ?, ?, ?, ?, ?, ?, NOW()); '
    // '  FROM dual ' +
    // ' WHERE NOT EXISTS (SELECT \'X\' FROM `log_user_quiz` WHERE `user_id` = ? AND `quiz_id` = ?); ',

};

// 로깅
QUERY.LOG_CHECKLIST = {
  InsertUserAnswers:
    'INSERT INTO `log_user_checklist` (`user_id`, `training_user_id`, `edu_id`, `course_id`, `course_list_id`, `checklist_id`, `answer`, `created_dt`) ' +
    'VALUES (?, ?, ?, ?, ?, ?, ?, NOW()); '
};

// 포인트 관련
QUERY.POINT = {

    // 사용자 포인트 상세내역
  GetUserPointDetails:
    'SELECT lup.`logs` ' +
    '      , ((lup.`complete` * epw.`point_complete`) + ' +
    '        (lup.`quiz_correction` * epw.`point_quiz`) + ' +
    '        (lup.`final_correction` * epw.`point_final`) + ' +
    '        (lup.`reeltime` * epw.`point_reeltime`) + ' +
    '        (lup.`speed` * epw.`point_speed`) + ' +
    '        (lup.`repetition` * epw.`point_repetition`)) AS point_total ' +
    '     , DATE_FORMAT(lae.`start_dt`, \'%Y-%m-%d\') AS start_dt ' +
    '     , DATE_FORMAT(lae.`end_dt`, \'%Y-%m-%d\') AS end_dt ' +
    '  FROM `log_user_point` AS lup ' +
    ' INNER JOIN `training_users` AS tu ' +
    '    ON lup.`training_user_id` = tu.`id` ' +
    ' INNER JOIN `training_edu` AS te ' +
    '    ON tu.`training_edu_id` = te.`id` ' +
    '   AND te.`active` = 1 ' +
    '  LEFT JOIN `log_assign_edu` AS lae ' +
    '    ON lae.`training_edu_id` = te.`id` ' +
    '   AND lae.`active` = 1 ' +
    '  LEFT JOIN `edu_point_weight` AS epw ' +
    '    ON lup.`edu_id` = epw.`edu_id` ' +
    '   AND epw.`id` = (SELECT MAX(`id`) FROM `edu_point_weight` WHERE `fc_id` = ? AND `edu_id` = epw.`edu_id`) ' +
    ' WHERE lup.`user_id` = ? ' +
    '   AND lup.`logs` IS NOT NULL ' +
    ' ORDER BY lae.`start_dt` DESC; ',

  // 포인트 조회
  SEL_POINT_WEIGHT:
    'SELECT pw.`point_complete` ' +
    '     , pw.`point_quiz` ' +
    '     , pw.`point_final` ' +
    '     , pw.`point_reeltime` ' +
    '     , pw.`point_speed` ' +
    '     , pw.`point_repetition` ' +
    '  FROM `point_weight` AS pw ' +
    '  LEFT JOIN `admin` AS a ' +
    '    ON a.`id` = pw.`setter_id` ' +
    ' WHERE a.`fc_id` = ? ' +
    ' ORDER BY pw.`created_dt` DESC ' +
    ' LIMIT 1; ',

  // 포인트 현황
  SEL_USER_POINT:
    'SELECT SUM(lup.`complete` * epw.`point_complete` + ' +
    '           lup.`quiz_correction` * epw.`point_quiz` + ' +
    '           lup.`final_correction` * epw.`point_final` + ' +
    '           lup.`reeltime` * epw.`point_reeltime` + ' +
    '           lup.`speed` * epw.`point_speed` + ' +
    '           lup.`repetition` * epw.`point_repetition`) AS point_total ' +
    '  FROM `log_user_point` AS lup ' +
    '  LEFT JOIN `edu_point_weight` AS epw ' +
    '    ON lup.`edu_id` = epw.`edu_id` ' +
    '   AND epw.`id` = (SELECT MAX(`id`) FROM `edu_point_weight` WHERE `fc_id` = ? AND `edu_id` = epw.`edu_id`) ' +
    ' INNER JOIN `users` AS u ' +
    '    ON lup.`user_id` = u.`id` ' +
    '   AND u.`fc_id` = ? ' +
    '   AND u.`id` = ?; ',

  // 사용자 포인트 로그 입력
  INS_POINT_LOG:
    'INSERT IGNORE `log_user_point` (`user_id`, `training_user_id`, `edu_id`) ' +
    'SELECT ?, ?, ? ',
    // '  FROM `log_user_point` AS lup ',
    // ' WHERE NOT EXISTS (SELECT \'X\' FROM `log_user_point` WHERE training_user_id = ?); ',

  // 사용자 포인트 로그 최초 갱신
  UPD_POINT_LOG:
    'UPDATE `log_user_point` SET ' +
    '       complete = ? ' +
    '     , quiz_correction = ? ' +
    '     , final_correction = ? ' +
    '     , reeltime = ? ' +
    '     , speed = ? ' +
    '     , repetition = ? ' +
    '     , logs = ? ' +
    '     , video_refresh_count = video_refresh_count + ? ' +
    '     , updated_dt = NOW() ' +
    ' WHERE training_user_id = ?; ',

  // 특정 교육과정의 전체 강의수와 이수한 강의수를 가져온다.
  SEL_COURSE_PROGRESS:
    'SELECT COUNT(cg.`course_id`) AS total ' +
    '     , SUM(CASE WHEN lcp.end_dt IS NULL THEN 0 ELSE 1 END) AS done ' +
    '  FROM `course_group` AS cg ' +
    '  LEFT JOIN `log_course_progress` AS lcp ' +
    '    ON cg.`course_id` = lcp.`course_id` ' +
    '   AND lcp.`training_user_id` = ? ' +
    ' WHERE cg.`group_id` = ? ',

  // 특정 교육과정의 타입별(QUIZ/FINAL) 문항수를 가져온다.
  // @params : course_group_id, type (course_list)
  SEL_QUIZ_COUNT:
    'SELECT COUNT(*) AS quiz_count ' +
    '  FROM `course_list` AS cl ' +
    ' INNER JOIN `quiz_group` AS qg ' +
    '    ON cl.`quiz_group_id` = qg.`group_id` ' +
    ' WHERE EXISTS (SELECT \'X\' FROM `course_group` WHERE `course_id` = cl.`course_id` AND `group_id` = ?) ' +
    '   AND cl.`type` = ? ',

  // 특정 타입의 맞은 문항수를 가져온다.
  // @params : training_user_id, course_id, course_list_type (course_list)
  SEL_QUIZ_CORRECT_COUNT:
    'SELECT COUNT(*) AS total_quiz_count ' +
    '     , IFNULL(( ' +
    '        SELECT count(*) AS quiz_count ' +
    '          FROM `log_user_quiz` AS luq  ' +
    '         WHERE luq.`training_user_id` = ? ' +
    '           AND luq.`course_list_type` = cl.`type` ' +
    '           AND luq.`correction` = 1 ' +
    '           AND luq.`id` = (SELECT MIN(`id`) FROM `log_user_quiz` WHERE `training_user_id` = luq.`training_user_id` AND `quiz_id` = luq.`quiz_id`) ' +
    '       ), 0) AS user_quiz_count ' +
    '  FROM `course_list` AS cl  ' +
    ' INNER JOIN `quiz_group` AS qg ' +
    '    ON cl.`quiz_group_id` = qg.`group_id` ' +
    ' WHERE EXISTS (SELECT \'X\' FROM `course_group` WHERE `course_id` = cl.`course_id` AND `group_id` = ?) ' +
    '   AND cl.`type` = ?; ',

  // 특정 교육과정의 퀴즈 맞은 비율을 기록한다.
  UPD_QUIZ_CORRECTION:
    'UPDATE `log_user_point` SET `quiz_correction` = ?, evaluated_dt = NOW() WHERE `training_user_id` = ? ',

  // 특정 교육과정의 파이널 테스트 맞은 비율을 기록한다.
  UPD_FINAL_CORRECTION:
    'UPDATE `log_user_point` SET `final_correction` = ?, evaluated_dt = NOW() WHERE `training_user_id` = ? ',

  // 교육과정의 기간을 구한다.
  SEL_EDU_PERIOD:
    'SELECT DATEDIFF(`end_dt`, `start_dt`) AS period ' +
    '  FROM `edu`; ',

  // 사용자가 이수한 기간을 구한다.
  SEL_USER_PERIOD:
    'SELECT DATEDIFF(tu.`end_dt`, tu.`start_dt`) AS user_period ' +
    '     , DATEDIFF(lae.`end_dt`, lae.`start_dt`) AS edu_period ' +
    '     , DATE_FORMAT(tu.`start_dt`, \'%Y-%m-%d\') AS edu_start_dt ' +
    '     , DATE_FORMAT(tu.`end_dt`, \'%Y-%m-%d\') AS edu_end_dt ' +
    '     , TIME_TO_SEC(TIMEDIFF(tu.end_dt, tu.start_dt)) AS user_period_by_seconds ' +
    '     , TIME_TO_SEC(TIMEDIFF(lae.end_dt, lae.start_dt)) AS edu_period_by_seconds ' +
    '  FROM `training_users` AS tu ' +
    ' INNER JOIN `training_edu` AS te ' +
    '    ON tu.`training_edu_id` = te.`id` ' +
    '   AND te.active = 1 ' +
    ' INNER JOIN `log_assign_edu` AS lae ' +
    '   ON lae.`training_edu_id` = te.`id` ' +
    ' WHERE tu.`id` = ?; ',

  // 교육과정 이수, 교육과정 이수 속도를 기록
  UPD_EDU_RESULTS:
    'UPDATE `log_user_point` SET complete = 1, speed = ? WHERE `training_user_id` = ?; ',

  // 교육 시청시간 (비디오 시청시간 ÷ 비디오 재생시간) 조회
  SEL_VIDEO_RESULTS:
    // "SELECT TRUNCATE(AVG(CASE WHEN r.rate > 1 THEN 1 ELSE r.rate END), 2) AS rate " +
    'SELECT SUM(r.`duration`) AS duration, SUM(r.`played_seconds`) AS played_seconds ' +
    '  FROM ( ' +
    '        SELECT luv.`video_id` ' +
    '             , IFNULL(MAX(luv.`duration`), 0) AS duration ' +
    '             , SUM(luv.`play_seconds`) AS played_seconds ' +
    '         FROM `log_user_video` AS luv ' +
    '        WHERE EXISTS ( ' +
    '               SELECT \'X\' ' +
    '                  FROM `course_list` AS cl ' +
    '                 WHERE EXISTS (SELECT \'X\' FROM `course_group` WHERE `course_id` = cl.`course_id` AND `group_id` = ?) ' +
    '                   AND cl.`type` = \'VIDEO\' ' +
    '                   AND cl.`video_id` = luv.video_id ' +
    '              ) ' +
    '          AND luv.`training_user_id` = ? ' +
    '        GROUP BY luv.`video_id` ' +
    '      ) AS r; ',

  SEL_VIDEO_RESULTS2:
  'SELECT lsp.`training_user_id` ' +
  '     , SUM(`refresh_count`) AS refresh_count ' +
  '     , COUNT(*) AS video_count ' +
  '     , SUM(CASE WHEN lsp.`end_dt` IS NULL THEN 0 ELSE 1 END) AS video_watch_count ' +
  '  FROM `log_session_progress` AS lsp ' +
  ' INNER JOIN `course_list` AS cl ' +
  '    ON cl.`id` = lsp.`course_list_id` ' +
  '   AND cl.`type` = \'VIDEO\' ' +
  '   AND EXISTS (SELECT \'X\' FROM `course_group` WHERE `course_id` = cl.`course_id` AND `group_id` = ?) ' +
  ' WHERE lsp.`training_user_id` = ? ' +
  ' GROUP BY lsp.`training_user_id` ',

  // 교육 시청시간 (비디오 시청시간 ÷ 비디오 재생시간) 갱신
  UPD_VIDEO_RESULTS:
    'UPDATE `log_user_point` SET reeltime = ? WHERE `training_user_id` = ?; ',

  // 강의 반복율 갱신
  UPD_COURSE_REPEAT:
    'UPDATE `log_user_point` SET repetition = ? WHERE `training_user_id` = ?; '

};

QUERY.BOARD = {
  Select: `
    SELECT b.id
         , b.parent_id
         , b.title
         , b.contents
         , b.hits
         , b.creator_id
         , b.creator_name
         , b.created_date
         , b.file_name
      FROM board AS b
     WHERE b.fc_id = ?
     ORDER BY b.created_date DESC
     LIMIT 3;
  `,

  SelectDetail: `
    SELECT b.id
        , b.parent_id
        , b.title
        , b.contents
        , b.hits
        , b.creator_id
        , b.creator_name
        , b.created_date
        , b.file_name
      FROM board AS b
    WHERE b.id = ?
    ORDER BY b.created_date DESC;
  `
};
module.exports = QUERY;
