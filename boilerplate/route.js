
// POST
router.post('/routename', function (req, res) {

  var inputs = {
    course_id: req.body.course_id
  };

  console.log(inputs.course_id);

  res.json({
    'success': true,
    'msg': '성공!'
  });

});