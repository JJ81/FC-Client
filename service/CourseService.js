/**
 * Created by yijaejun on 03/01/2017.
 */
var QUERY = require('../database/query');
var async = require('async');
var CourseService = {};

/**
 * 퀴즈리스트를 가공한다.
 */
CourseService.makeQuizList = function (quiz_list) {

    var quiz_id = null;
    var return_list = [];            

    // 데이터를 가공한다.
    // 퀴즈 별도 obj 로 분리.
    // 보기 array 형태로 퀴즈별로 할당
    quiz_list.forEach(function (quiz) {
        
        if (quiz_id !== quiz.quiz_id) {
            
            var quizdata = {};
            
            switch (quiz.quiz_type) {
                case "A": // 단답형       
                    quizdata = {
                        type: quiz.type,
                        quiz_id : quiz.quiz_id,
                        quiz_type: quiz.quiz_type,
                        question: quiz.question,
                        answer: quiz.answer_desc,
                        order: quiz.quiz_order
                    };
                    break;

                case "B": // 선택형    
                case "C": // 다답형      
                    quizdata = {
                        type: quiz.type,
                        quiz_id : quiz.quiz_id,
                        quiz_type: quiz.quiz_type,
                        question: quiz.question,
                        answer: [],
                        order: quiz.quiz_order,
                        option_group_id: quiz.option_group_id,
                        options: []
                    };

                    var optiondata = quiz_list.filter(function (data) {
                        return data.quiz_id == quiz.quiz_id && data.option !== null;
                    });
                    
                    if (optiondata) {
                        for (var index = 0; index < optiondata.length; index++) {
                            var option = optiondata[index];

                            if (option.iscorrect) {
                                quizdata.answer.push(option.option);
                            }

                            quizdata.options.push ({
                                id: option.option_id,
                                opt_id: option.option_group_id,
                                option: option.option,
                                iscorrect: option.iscorrect,
                                order: option.option_order
                            });
                        }

                        quizdata.answer = quizdata.answer.join(", ");
                    }

                    break;     
                                                
                default:
                    break;
            }

            // 마지막 quiz_id 를 임시 저장한다.
            quiz_id = quiz.quiz_id;
            // 퀴즈를 리스트에 입력한다.
            return_list.push(quizdata);
        }
    });
    
    return return_list;   

};

module.exports = CourseService;