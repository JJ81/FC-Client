/*credit , debit etc.. 계산이 필요한 작업은 calculate.js 에서 진행한다*/



module.exports.creditResult = function (currentBalance, amount) {
  return (creditSum(Number(currentBalance), Number(amount)));
};

module.exports.debitResult = function (currentBalance, amount) {
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

