var QUERY = {};

QUERY.HOME = {
  READ: "select * from `agent_wallet_history` as awh " +
  "where `agent_id`= ? " +
  "order by `date` desc limit 1000;",
  READBYDATE: "select * from `agent_wallet_history` as awh " +
  "where `agent_id`= ? and `date` >= ? and `date` <= ?" +
  "order by `date` desc limit 1000;",
  LOG_WALLET: 'insert into `agent_wallet_history` set ?'
};


QUERY.HOME_INFO = {
  LOG_CREDIT_INFO: {
    agent_id: null,
    type: null,
    amount: null,
    balance: null,
    target_agent_id: null,
    target_player_id: null,
    memo: null
  }
};


QUERY.AGENT = {
  delete: "",
  login: 'select * from `admin` where `email`=?',
  create: 'insert into `agent` set ?;',
  changePassword: 'update `agent` set `password` = ? where `code` = ?;',
  SUSPEND: 'update `agent` set `suspend` = ? where `code` = ?;'
  , READ_ALL_AGENT: 'select * from `agent` order by `layer` asc;'
  , READ_ONE_AGENT: 'select * from `agent` where `code`=? order by `layer` asc;'
  , READ_AGENT_TOP_TIER: 'select *from `agent` where `layer` is not null and `layer` <= 3 order by `layer` asc;'
  , READ_AGENT_LIST_LAYER_1: 'select *from `agent` where `top_parent_id` = ? and `layer` >= ? order by `layer` asc;'
  , READ_AGENT_LIST_LAYER_2: 'select *from `agent` where `code`=? or `parent_id`=? order by `layer` asc;'
  , READ_AGENT_LIST_LAYER_3: 'select *from `agent` where `code`=?;;'
  , UPDATE_AMOUNT_CREDIT: 'update `agent` set `balance` = `balance` + ? where `code`= ? '
  , UPDATE_AMOUNT_DEBIT: 'update `agent` set `balance` = `balance` - ? where `code`= ? '
  , READ_BALANCE: 'select `balance` from `agent` where `code` = ?'

};


QUERY.PLAYER = {
  READ: 'select u.user_id as username, u.nickname, u.market_code as agent, u.banned, u.signup_dt, u.balance, u.game_login ' +
  'from `user` as u order by `signup_dt` desc;'
  ,
  READ_BOTTOM_LAYERS_PLAYER: 'select u.user_id as username, u.nickname, u.market_code as agent, u.banned, u.signup_dt, u.balance, u.game_login ' +
  'from `user` as u where `top_parent_id`=? order by `signup_dt` desc;'
  ,
  READ_ALL_PLAYER: 'select u.user_id as username, u.nickname, u.market_code as agent, u.banned, u.signup_dt, u.balance, u.game_login ' +
  'from `user` as u order by `signup_dt` desc;'
  ,
  READ_SOME_PLAYER: 'select u.user_id as username, u.nickname, u.market_code as agent, u.banned, u.signup_dt, u.balance, u.game_login ' +
  'from `user` as u where `market_code`=? and `mark` ' +
  'order by `signup_dt` desc;'
  ,
  READ_AGENT_LIST: 'select *from `agent` where `top_parent_id` = ? and `layer` >= ?; '
  ,
  READ_PLAYER_LAYER_3: 'select u.user_id as username, u.nickname, u.market_code as agent, u.banned, u.signup_dt, u.balance, u.game_login ' +
  ' from `user` as u where u.`market_code` = ? ' +
  'order by `signup_dt` desc;'
  ,
  READ_PAYER_LAYER_1: 'select *from `user` where `market_code` in (?) order by `signup_dt` desc;'
  ,
  UPDATE_CREDIT: 'update `user` set `balance` =? where `user_id` =?;'

};


module.exports = QUERY;