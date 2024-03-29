'use strict';

var express = require('express');
var controller = require('./tweet.controller');

var router = express.Router();

router.get('/', controller.index);
// router.get('/search', controller.search);
router.get('/by-user/:userId', controller.byUser);
// router.get('/getEmotions', controller.getEmotions);
router.get('/getSentiment', controller.getSentiment);
router.get('/stop-stream', controller.stopStream);
router.get('/start-stream', controller.initiateStream);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.upsert);
router.patch('/:id', controller.patch);
router.delete('/:id', controller.destroy);

module.exports = router;
