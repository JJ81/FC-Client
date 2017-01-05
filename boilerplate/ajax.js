

// 요청 Url + 추가적 데이터, 완료된 후 리턴 메시지를 받음  
// 참고 : http://rocabilly.tistory.com/27
$.ajax({   
  type: "POST",   
  url: "",   
  data: { key: "value", location: "Boston" }   
}).done(function(res) {   
  alert(res.msg);   
});  