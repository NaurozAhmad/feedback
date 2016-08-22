'use strict';

var app = require('../..');
import request from 'supertest';

var newHashtag;

describe('Hashtag API:', function() {
  describe('GET /api/hashtags', function() {
    var hashtags;

    beforeEach(function(done) {
      request(app)
        .get('/api/hashtags')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          hashtags = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      hashtags.should.be.instanceOf(Array);
    });
  });

  describe('POST /api/hashtags', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/hashtags')
        .send({
          name: 'New Hashtag',
          info: 'This is the brand new hashtag!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newHashtag = res.body;
          done();
        });
    });

    it('should respond with the newly created hashtag', function() {
      newHashtag.name.should.equal('New Hashtag');
      newHashtag.info.should.equal('This is the brand new hashtag!!!');
    });
  });

  describe('GET /api/hashtags/:id', function() {
    var hashtag;

    beforeEach(function(done) {
      request(app)
        .get(`/api/hashtags/${newHashtag._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          hashtag = res.body;
          done();
        });
    });

    afterEach(function() {
      hashtag = {};
    });

    it('should respond with the requested hashtag', function() {
      hashtag.name.should.equal('New Hashtag');
      hashtag.info.should.equal('This is the brand new hashtag!!!');
    });
  });

  describe('PUT /api/hashtags/:id', function() {
    var updatedHashtag;

    beforeEach(function(done) {
      request(app)
        .put(`/api/hashtags/${newHashtag._id}`)
        .send({
          name: 'Updated Hashtag',
          info: 'This is the updated hashtag!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedHashtag = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedHashtag = {};
    });

    it('should respond with the original hashtag', function() {
      updatedHashtag.name.should.equal('New Hashtag');
      updatedHashtag.info.should.equal('This is the brand new hashtag!!!');
    });

    it('should respond with the updated hashtag on a subsequent GET', function(done) {
      request(app)
        .get(`/api/hashtags/${newHashtag._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let hashtag = res.body;

          hashtag.name.should.equal('Updated Hashtag');
          hashtag.info.should.equal('This is the updated hashtag!!!');

          done();
        });
    });
  });

  describe('PATCH /api/hashtags/:id', function() {
    var patchedHashtag;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/hashtags/${newHashtag._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Hashtag' },
          { op: 'replace', path: '/info', value: 'This is the patched hashtag!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedHashtag = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedHashtag = {};
    });

    it('should respond with the patched hashtag', function() {
      patchedHashtag.name.should.equal('Patched Hashtag');
      patchedHashtag.info.should.equal('This is the patched hashtag!!!');
    });
  });

  describe('DELETE /api/hashtags/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/hashtags/${newHashtag._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when hashtag does not exist', function(done) {
      request(app)
        .delete(`/api/hashtags/${newHashtag._id}`)
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
