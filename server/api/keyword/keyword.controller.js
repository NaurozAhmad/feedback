/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/keywords              ->  index
 * POST    /api/keywords              ->  create
 * GET     /api/keywords/:id          ->  show
 * PUT     /api/keywords/:id          ->  upsert
 * PATCH   /api/keywords/:id          ->  patch
 * DELETE  /api/keywords/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Keyword from './keyword.model';
import Tweet from '../tweet/tweet.model';

var watson = require('watson-developer-cloud');
var alchemy_language = watson.alchemy_language({
	api_key: '094aa906dc796e7fdff6f28e6ac8267abde01100'
});

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
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

// Gets a list of Keywords
export function index(req, res) {
  return Keyword.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Keyword from the DB
export function show(req, res) {
  return Keyword.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Keyword in the DB
export function create(req, res) {
  return Keyword.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Keyword in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Keyword.findOneAndUpdate(req.params.id, req.body, {upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Keyword in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Keyword.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Keyword from the DB
export function destroy(req, res) {
  return Keyword.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

export function getKeywords(req, res) {
	var allText = '';
	Tweet.find().exec()
		.then(function(tweets) {
			for (var i = 0; i < tweets.length; i++) {
				if (tweets[i].lang === 'en') {
					allText = allText + tweets[i].text;
				}
				if (i === tweets.length - 1) {
					var regexpHash = new RegExp('#([^\\s]*)', 'g');
					var regexpHTTP = new RegExp('http([^\\s]*)', 'g');
					var regexpTitle = new RegExp('@([^\\s]*)', 'g');
					var regexpHTTRT = new RegExp('htt…RT', 'g');
					var regexpHTTRT2 = new RegExp('h…RT', 'g');
					allText = allText.replace(regexpHash, '');
					allText = allText.replace(regexpHTTP, '');
					allText = allText.replace(regexpTitle, '');
					allText = allText.replace(regexpHTTRT, '');
					allText = allText.replace(regexpHTTRT2, '');
					allText = allText.replace(/\s+/g, ' ').trim();
					console.log(allText);
					var parameters = {
						text: allText
					};

					alchemy_language.keywords(parameters, function(err, response) {
						if (err) {
							console.log('error:', err);
						}
						else {
							console.log(response);
							Keyword.collection.insert(response.keywords, onInsert);
							function onInsert() {
								res.status(200).send(response.keywords);
							}
						}
					});
				}
			}
		}, function(error) {
			if (error) {
				console.log('ERROR', error);
			}
		});
}