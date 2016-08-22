'use strict';

var express = require('express');
var controller = require('./tweet.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/search', controller.search);
router.get('/getEmotions', controller.getEmotions);
router.get('/getSentiment', controller.getSentiment);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.upsert);
router.patch('/:id', controller.patch);
router.delete('/:id', controller.destroy);

module.exports = router;
