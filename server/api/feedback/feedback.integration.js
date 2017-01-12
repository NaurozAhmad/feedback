'use strict';

var app = require('../..');
import request from 'supertest';

var newFeedback;

describe('Feedback API:', function() {
  describe('GET /api/feedbacks', function() {
    var feedbacks;

    beforeEach(function(done) {
      request(app)
        .get('/api/feedbacks')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          feedbacks = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      feedbacks.should.be.instanceOf(Array);
    });
  });

  describe('POST /api/feedbacks', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/feedbacks')
        .send({
          name: 'New Feedback',
          info: 'This is the brand new feedback!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newFeedback = res.body;
          done();
        });
    });

    it('should respond with the newly created feedback', function() {
      newFeedback.name.should.equal('New Feedback');
      newFeedback.info.should.equal('This is the brand new feedback!!!');
    });
  });

  describe('GET /api/feedbacks/:id', function() {
    var feedback;

    beforeEach(function(done) {
      request(app)
        .get(`/api/feedbacks/${newFeedback._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          feedback = res.body;
          done();
        });
    });

    afterEach(function() {
      feedback = {};
    });

    it('should respond with the requested feedback', function() {
      feedback.name.should.equal('New Feedback');
      feedback.info.should.equal('This is the brand new feedback!!!');
    });
  });

  describe('PUT /api/feedbacks/:id', function() {
    var updatedFeedback;

    beforeEach(function(done) {
      request(app)
        .put(`/api/feedbacks/${newFeedback._id}`)
        .send({
          name: 'Updated Feedback',
          info: 'This is the updated feedback!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedFeedback = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedFeedback = {};
    });

    it('should respond with the original feedback', function() {
      updatedFeedback.name.should.equal('New Feedback');
      updatedFeedback.info.should.equal('This is the brand new feedback!!!');
    });

    it('should respond with the updated feedback on a subsequent GET', function(done) {
      request(app)
        .get(`/api/feedbacks/${newFeedback._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let feedback = res.body;

          feedback.name.should.equal('Updated Feedback');
          feedback.info.should.equal('This is the updated feedback!!!');

          done();
        });
    });
  });

  describe('PATCH /api/feedbacks/:id', function() {
    var patchedFeedback;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/feedbacks/${newFeedback._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Feedback' },
          { op: 'replace', path: '/info', value: 'This is the patched feedback!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedFeedback = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedFeedback = {};
    });

    it('should respond with the patched feedback', function() {
      patchedFeedback.name.should.equal('Patched Feedback');
      patchedFeedback.info.should.equal('This is the patched feedback!!!');
    });
  });

  describe('DELETE /api/feedbacks/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/feedbacks/${newFeedback._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when feedback does not exist', function(done) {
      request(app)
        .delete(`/api/feedbacks/${newFeedback._id}`)
        .expect(404)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });
  });
});
