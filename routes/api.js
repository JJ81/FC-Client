var express = require('express');
var router = express.Router();
const util = require('../util/util');
const pool = require('../commons/db_conn_pool');
const AquaPlayerService = require('../service/AquaPlayerService');
const QUERY = require('../database/query');

require('../commons/helpers');
router.get('/aquaplayer', util.getLogoInfo, AquaPlayerService.getPlayer);
router.post('/aquaplayer/data', AquaPlayerService.getBookmarkData);
router.get('/aquademo', AquaPlayerService.demo);
router.get('/player/encparam', AquaPlayerService.getEncodedParam);

const aws = require('aws-sdk');
aws.config.loadFromPath('../secret/aws_config.json');

// /api/v1/notices
router.get('/notices', util.isAuthenticated, (req, res, next) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;

    connection.query(QUERY.BOARD.Select, [ req.user.fc_id ], (err, result) => {
      connection.release();

      if (err) {
        console.log(err);
        res.json({
          success: false,
          msg: err
        });
      } else {
        res.send({
          list: result,
          loggedIn: req.user
        });
      }
    });
  });
});

router.get('/s3-download', (req, res, next) => {
  console.log(req.query);
  const { key } = req.query;
  const params = {
    Bucket: 'orange-learning',
    Key: key
  };
  const s3 = new aws.S3();

  res.attachment(key);
  var fileStream = s3.getObject(params).createReadStream();
  fileStream.pipe(res);
});

module.exports = router;
