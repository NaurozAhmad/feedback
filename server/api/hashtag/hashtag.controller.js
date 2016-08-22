/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/hashtags              ->  index
 * POST    /api/hashtags              ->  create
 * GET     /api/hashtags/:id          ->  show
 * PUT     /api/hashtags/:id          ->  upsert
 * PATCH   /api/hashtags/:id          ->  patch
 * DELETE  /api/hashtags/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Hashtag from './hashtag.model';

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

// Gets a list of Hashtags
export function index(req, res) {
  return Hashtag.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Hashtag from the DB
export function show(req, res) {
  return Hashtag.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Hashtag in the DB
export function create(req, res) {
  return Hashtag.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Hashtag in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Hashtag.findOneAndUpdate(req.params.id, req.body, {upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Hashtag in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Hashtag.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Hashtag from the DB
export function destroy(req, res) {
  return Hashtag.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
