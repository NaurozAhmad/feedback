'use strict';

var app = require('../..');
import request from 'supertest';

var newTweet;

describe('Tweet API:', function() {
  describe('GET /api/tweets', function() {
    var tweets;

    beforeEach(function(done) {
      request(app)
        .get('/api/tweets')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          tweets = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      tweets.should.be.instanceOf(Array);
    });
  });

  describe('POST /api/tweets', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/tweets')
        .send({
          name: 'New Tweet',
          info: 'This is the brand new tweet!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newTweet = res.body;
          done();
        });
    });

    it('should respond with the newly created tweet', function() {
      newTweet.name.should.equal('New Tweet');
      newTweet.info.should.equal('This is the brand new tweet!!!');
    });
  });

  describe('GET /api/tweets/:id', function() {
    var tweet;

    beforeEach(function(done) {
      request(app)
        .get(`/api/tweets/${newTweet._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          tweet = res.body;
          done();
        });
    });

    afterEach(function() {
      tweet = {};
    });

    it('should respond with the requested tweet', function() {
      tweet.name.should.equal('New Tweet');
      tweet.info.should.equal('This is the brand new tweet!!!');
    });
  });

  describe('PUT /api/tweets/:id', function() {
    var updatedTweet;

    beforeEach(function(done) {
      request(app)
        .put(`/api/tweets/${newTweet._id}`)
        .send({
          name: 'Updated Tweet',
          info: 'This is the updated tweet!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedTweet = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedTweet = {};
    });

    it('should respond with the original tweet', function() {
      updatedTweet.name.should.equal('New Tweet');
      updatedTweet.info.should.equal('This is the brand new tweet!!!');
    });

    it('should respond with the updated tweet on a subsequent GET', function(done) {
      request(app)
        .get(`/api/tweets/${newTweet._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let tweet = res.body;

          tweet.name.should.equal('Updated Tweet');
          tweet.info.should.equal('This is the updated tweet!!!');

          done();
        });
    });
  });

  describe('PATCH /api/tweets/:id', function() {
    var patchedTweet;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/tweets/${newTweet._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Tweet' },
          { op: 'replace', path: '/info', value: 'This is the patched tweet!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedTweet = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedTweet = {};
    });

    it('should respond with the patched tweet', function() {
      patchedTweet.name.should.equal('Patched Tweet');
      patchedTweet.info.should.equal('This is the patched tweet!!!');
    });
  });

  describe('DELETE /api/tweets/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/tweets/${newTweet._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when tweet does not exist', function(done) {
      request(app)
        .delete(`/api/tweets/${newTweet._id}`)
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
