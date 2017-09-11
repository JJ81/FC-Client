var express = require('express');
var router = express.Router();
var mysql_dbc = require('../commons/db_conn')();
var connection = mysql_dbc.init();
var QUERY = require('../database/query');
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
};
require('../commons/helpers');
const AquaPlayerService = require('../service/AquaPlayerService');

router.get('/aquaplayer', AquaPlayerService.getPlayer);

module.exports = router;
