var util ={};



util.objEmptyCheck = function(obj){
  for(var key in obj){
    if(obj[key].length ===0){
      return false;
    }
  }
  return true;
};

module.exports = util;