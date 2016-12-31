var util ={};



util.objEmptyCheck = function(obj){
  for(var key in obj){
    if(obj[key].length ===0){
      return false;
    }
  }
  return true;
};

/*Credit / Debit 계산*/
util.creditResult = function (currentBalance, amount) {
  return (creditSum(Number(currentBalance), Number(amount)));
};

util.debitResult = function (currentBalance, amount) {
  return (debitSum(Number(currentBalance), Number(amount)));
};

function creditSum(currentBalance, amount) {

  var newBalance = Number(currentBalance + amount);

  if (newBalance < 0) {
    return false;
  } else {
    return newBalance;
  }
}

function debitSum(currentBalance, amount) {

  var newBalance = Number(currentBalance - amount);

  if (newBalance < 0) {
    return false;
  } else {
    return newBalance;
  }
}
module.exports = util;