/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/feedbacks              ->  index
 * POST    /api/feedbacks              ->  create
 * GET     /api/feedbacks/:id          ->  show
 * PUT     /api/feedbacks/:id          ->  upsert
 * PATCH   /api/feedbacks/:id          ->  patch
 * DELETE  /api/feedbacks/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Feedback from './feedback.model';
import Hashtag from '../hashtag/hashtag.model';
import sentiment from 'sentiment';
import request from 'request';

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

export function getTags(req, res) {
  console.log('HIT');
  Hashtag.find({
    userId: req.params.userId
  }).exec().then(function(hashtags) {
    res.status(200).send(hashtags);
  });
}

// Gets a list of Feedbacks
export function index(req, res) {
  return Feedback.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function byUser(req, res) {
  return Feedback.find({
    userId: req.params.userId
  }).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Feedback from the DB
export function show(req, res) {
  return Feedback.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Feedback in the DB
export function create(req, res) {
  console.log('FEEDBACK', req.body);
  var feedback = req.body;

  var toSend = feedback.text.replace(/…/g);
  toSend = toSend.replace(/[^a-zA-Z\. ]/g, '');
  var options = {
    uri: 'http://139.162.163.37:5000/analyze',
    method: 'POST',
    json: {
      'text': toSend
    }
  };
  request(options, function(err,
    response, body) {
    if (err) {
      console.log('ERROR', err);
      return res.status(500).send(err);
    } else {
      console.log('BODY', body);
      feedback.sentiment = {};
      feedback.sentiment.score = parseInt(body.score);
      feedback.sentiment.probability = parseInt(body.probability);
      feedback.submitted = new Date();
      console.log('SUBMITTING FEEDBACK', feedback);
      return Feedback.create(feedback)
        .then(respondWithResult(res, 201))
        .catch(handleError(res));
    }
  });
}

// Upserts the given Feedback in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Feedback.findOneAndUpdate({_id: req.params.id}, req.body, {upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Feedback in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Feedback.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Feedback from the DB
export function destroy(req, res) {
  return Feedback.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
