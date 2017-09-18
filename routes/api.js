var express = require('express');
var router = express.Router();
const util = require('../util/util');
const AquaPlayerService = require('../service/AquaPlayerService');
require('../commons/helpers');

router.get('/aquaplayer', util.getLogoInfo, AquaPlayerService.getPlayer);
router.post('/aquaplayer/data', AquaPlayerService.getBookmarkData);
router.get('/aquademo', AquaPlayerService.demo);

module.exports = router;
