/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/tweets              ->  index
 * POST    /api/tweets              ->  create
 * GET     /api/tweets/:id          ->  show
 * PUT     /api/tweets/:id          ->  upsert
 * PATCH   /api/tweets/:id          ->  patch
 * DELETE  /api/tweets/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Tweet from './tweet.model';
import Hashtag from '../hashtag/hashtag.model';
import async from 'async';

var watson = require('watson-developer-cloud');
var TwitterREST = require('twitter');
var TwitterStream = require('node-tweet-stream');
var stream = new TwitterStream({
	consumer_key: 'bXbTYaf5N99W2HcLLkg8pg5Kx',
	consumer_secret: 'r4qQiPUNVsB9MgGMzEG7EzCSdm10sGXfuGle3bm0tnQJYr0Jth',
	token: '762285614825897984-T3Y5WKDXw9xsr1kBLTKXG3E6sbf7ijV',
	token_secret: 'v6RRBxEzEXbyRWS565wZvlahRDq16ialZEEeh95in73ib'
});
var rest = new TwitterREST({
	consumer_key: 'bXbTYaf5N99W2HcLLkg8pg5Kx',
	consumer_secret: 'r4qQiPUNVsB9MgGMzEG7EzCSdm10sGXfuGle3bm0tnQJYr0Jth',
	access_token_key: '762285614825897984-T3Y5WKDXw9xsr1kBLTKXG3E6sbf7ijV',
	access_token_secret: 'v6RRBxEzEXbyRWS565wZvlahRDq16ialZEEeh95in73ib'
});
var alchemy_language = watson.alchemy_language({
	api_key: '094aa906dc796e7fdff6f28e6ac8267abde01100'
});

function respondWithResult(res, statusCode) {
	statusCode = statusCode || 200;
	return function(entity) {
		if (entity) {
			return res.status(statusCode).json(entity);
		}
		return null;
	};
}

function patchUpdates(patches) {
	return function(entity) {
		try {
			jsonpatch.apply(entity, patches, /*validate*/ true);
		} catch (err) {
			return Promise.reject(err);
		}

		return entity.save();
	};
}

function removeEntity(res) {
	return function(entity) {
		if (entity) {
			return entity.remove()
				.then(() => {
					res.status(204).end();
				});
		}
	};
}

function handleEntityNotFound(res) {
	return function(entity) {
		if (!entity) {
			res.status(404).end();
			return null;
		}
		return entity;
	};
}

function handleError(res, statusCode) {
	statusCode = statusCode || 500;
	return function(err) {
		res.status(statusCode).send(err);
	};
}

// Gets a list of Tweets
export function index(req, res) {
	console.log('INITATE CALLED EPICLY');
	Hashtag.find().exec()
		.then(function(hashtags) {
			console.log(hashtags);
			for (var i = 0; i < hashtags.length; i++) {
				stream.track('#' + hashtags[i].name);
				console.log('Now tracking #' + hashtags[i].name);
			}
		});
	stream.on('tweet', function(tweet) {
		console.log('tweet received', tweet.text);
		var parameters = {
			text: tweet.text
		};
		tweet.sentiment = {};
		tweet.emotions = {};
		if (tweet.lang === 'en') {
			alchemy_language.emotion(parameters, function(emoError, emoResponse) {
				if (emoError)
					console.log('error:', emoError);
				else {
					alchemy_language.sentiment(parameters, function(sentiError, sentiResponse) {
						if (sentiError)
							console.log('SENTIMENT PROCESSING ERROR:', sentiError);
						else {
							console.log(sentiResponse);
							console.log(emoResponse);
							tweet.sentiment.sentiMixed = sentiResponse.docSentiment.mixed;
							tweet.sentiment.sentiScore = sentiResponse.docSentiment.score;
							tweet.sentiment.sentiType = sentiResponse.docSentiment.type;
							tweet.emotions.anger = emoResponse.docEmotions.anger;
							tweet.emotions.disgust = emoResponse.docEmotions.disgust;
							tweet.emotions.fear = emoResponse.docEmotions.fear;
							tweet.emotions.joy = emoResponse.docEmotions.joy;
							tweet.emotions.sadness = emoResponse.docEmotions.sadness;
							Tweet.create(tweet, (err, data) => {
								if (!err) {
									console.log('tweet created', tweet);
								}
							});
						}
					});
				}
			});
		}
	})

	stream.on('error', function(err) {
		console.log('Oh no', err);
	})

	return Tweet.find().exec()
		.then(respondWithResult(res))
		.catch(handleError(res));
}

export function search(req, res) {
	console.log('SEARCH INITIATED');
	Hashtag.findOne().exec()
		.then(function(hashtag) {
			rest.get('search/tweets', {
				q: '#' + hashtag.name,
				count: 40
			}, function(error, tweets, response) {
				if (error) {
					console.log(error);
				} else {
					for (var i = 0; i < tweets.statuses.length; i++) {
						if (tweets.statuses[i].coordinates) {
							console.log(i + ' ', tweets.statuses[i].coordinates);
						}
						Tweet.create(tweets.statuses[i], (err, data) => {
							if (!err) {}
						});
					}
					res.status(200).send(tweets);
				}
			})
		});
}

export function getEmotions(req, res) {
	function callback() {
		console.log('finished');
	}
	Tweet.find().exec()
		.then(function(tweets) {
			console.log("COUNT", tweets.length);
			async.eachSeries(tweets, function(tweet, callback) {
				var parameters = {
					text: tweet.text
				};
				alchemy_language.emotion(parameters, function(emoError, emoResponse) {
					console.log(emoResponse);
					if (emoError)
						console.log('error:', emoError);
					else {
						// console.log(response);
						alchemy_language.sentiment(parameters, function(sentiError, sentiResponse) {
							console.log(sentiResponse);
							if (sentiError)
								console.log('error:', sentiError);
							else {
								console.log(sentiResponse.docSentiment);
								console.log(emoResponse.docEmotions);
								// console.log(response);
								Tweet.update({
									_id: tweet._id
								}, {
									'sentiment.mixed': sentiResponse.docSentiment.mixed,
									'sentiment.score': sentiResponse.docSentiment.score,
									'sentiment.type': sentiResponse.docSentiment.type,
									'emotions.anger': emoResponse.docEmotions.anger,
									'emotions.disgust': emoResponse.docEmotions.disgust,
									'emotions.fear': emoResponse.docEmotions.fear,
									'emotions.joy': emoResponse.docEmotions.joy,
									'emotions.sadness': emoResponse.docEmotions.sadness
								}, {}, function(saveError, numAffected) {
									if (saveError) {
										console.log('EMOTION SAVE ERROR', saveError);
									} else {
										console.log('numAffected', numAffected);
										callback(null, saveError);
									}
								})
							}
						});
						/*Tweet.update({
							_id: tweet._id
						}, {

						}, {}, function(err, numAffected) {
							if (err) {
								console.log('EMOTION SAVE ERROR', err);
							} else {
								console.log('numAffected', numAffected);
							}
						})*/
					}
				});
			})
		}, function(error) {
			if (error) {
				console.log('ERROR', error);
			}
		});
	res.status(200).send('Done');
}

export function getSentiment(req, res) {
	Tweet.find().exec()
		.then(function(tweets) {
			async.each(tweets, function(tweet) {
				console.log(tweet);
				var parameters = {
					text: tweet.text
				};

			})
		}, function(error) {
			if (error) {
				console.log('ERROR', error);
			}
		});
	res.status(200).send('Done');
}

// Gets a single Tweet from the DB
export function show(req, res) {
	return Tweet.findById(req.params.id).exec()
		.then(handleEntityNotFound(res))
		.then(respondWithResult(res))
		.catch(handleError(res));
}

// Creates a new Tweet in the DB
export function create(req, res) {
	return Tweet.create(req.body)
		.then(respondWithResult(res, 201))
		.catch(handleError(res));
}

// Upserts the given Tweet in the DB at the specified ID
export function upsert(req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	return Tweet.findOneAndUpdate(req.params.id, req.body, {
		upsert: true,
		setDefaultsOnInsert: true,
		runValidators: true
	}).exec()

	.then(respondWithResult(res))
		.catch(handleError(res));
}

// Updates an existing Tweet in the DB
export function patch(req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	return Tweet.findById(req.params.id).exec()
		.then(handleEntityNotFound(res))
		.then(patchUpdates(req.body))
		.then(respondWithResult(res))
		.catch(handleError(res));
}

// Deletes a Tweet from the DB
export function destroy(req, res) {
	return Tweet.findById(req.params.id).exec()
		.then(handleEntityNotFound(res))
		.then(removeEntity(res))
		.catch(handleError(res));
}
