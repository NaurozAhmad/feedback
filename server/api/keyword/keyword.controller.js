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

var retext = require('retext');
var nlcstToString = require('nlcst-to-string');
var keywords = require('retext-keywords');

var extractor = require('gramophone');

/*var watson = require('watson-developer-cloud');
var alchemy_language = watson.alchemy_language({
  api_key: '094aa906dc796e7fdff6f28e6ac8267abde01100'
});*/

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

function addKeyword(keyword) {
  Keyword.findOne({ text: keyword.text }, function(err, model) {
    if (err) {
       return err;
    }
    if (model) {
      model.relevance = keyword.relevance;
      model.save(function(err, result) {
        if (err) {
          return err;
        }
        console.log('UPDATED', result);
        return result;
      });
    } else {
      Keyword.create(keyword, function(err, result) {
        if (err) {
          return err;
        }
        console.log('CREATED NEW', result);
        return result;
      });
    }
  })
}

function extractKeyphrases(allText) {
  /*return retext().use(keywords).process(allText, function(err, result) {
    // var iterate = 0;
    // var keywords = [];
    //result.data.keywords.forEach(function(keyword) {
    //  iterate = iterate + 1;
    //  var processed = nlcstToString(keyword.matches[0].node);
    //  keywords.push(processed);
    //});
    //console.log();
    //console.log('Key-phrases:');
    // console.log('PHRASES', result.data.keyphrases);
    var toIterate = result.data.keyphrases.length;
    var iterate = 0;
    return result.data.keyphrases.forEach(function(phrase) {
      iterate = iterate + 1;
      var toAdd = {
        text: phrase.matches[0].nodes.map(nlcstToString).join(''),
        relevance: phrase.score
      };
      keyphrases.push(toAdd);
      if (iterate === toIterate) {
        // console.log('KEYPHRASES', keyphrases);
        return true;
      }
    });
  });*/
}

function extractText(tweets) {
  var allText;
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
      return allText;
    }
  }
}

// Gets a list of Keywords
export function index(req, res) {
  Tweet.find().exec()
    .then(function(tweets) {
      var allText = extractText(tweets);
      var keyphrases = extractor.extract(allText, { score: true, limit: 20, ngrams: [2, 3, 4], cutoff: true });
      var total = 0;
      var iterate = 0;
      keyphrases.forEach(function(item) {
        iterate = iterate + 1;
        total = total + item.tf;
        if (iterate === 20) {
          for (var i = 0; i < keyphrases.length; i++) {
            var toAdd = {
              text: keyphrases[i].term,
              relevance: keyphrases[i].tf / total
            }
            console.log('TO ADD', toAdd);
            var result = addKeyword(toAdd);
            if (result instanceof Error) {
              return handleError(res);
            } else if (i === keyphrases.length - 1) {
              Keyword.find().exec()
                .then(function(models) {
                  return res.status(200).send(models);
                });
            }
          }
        }
      });
    }, function(error) {
      if (error) {
        console.log('ERROR', error);
        return handleError(res);
      }
    });
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
  if (req.body._id) {
    delete req.body._id;
  }
  return Keyword.findOneAndUpdate(req.params.id, req.body, {
    upsert: true,
    setDefaultsOnInsert: true,
    runValidators: true
  }).exec()

  .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Keyword in the DB
export function patch(req, res) {
  if (req.body._id) {
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

          retext().use(keywords).process(allText, function(err, result) {
            console.log('KEYWORDS: ');
            var keywords = [];
            var keyphrases = [];
            var iterate = 0;
            result.data.keywords.forEach(function(keyword) {
              iterate = iterate + 1;
              var processed = nlcstToString(keyword.matches[0].node);
              console.log(processed);
              keywords.push(processed);
            });
            console.log();
            console.log('Key-phrases:');
            result.data.keyphrases.forEach(function(phrase) {
              console.log(phrase.matches[0].nodes.map(nlcstToString).join(''));
            });
          });
          res.status(200).send('DONE');
        }
      }
    }, function(error) {
      if (error) {
        console.log('ERROR', error);
      }
    });
}
