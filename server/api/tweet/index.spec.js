'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var tweetCtrlStub = {
  index: 'tweetCtrl.index',
  show: 'tweetCtrl.show',
  create: 'tweetCtrl.create',
  upsert: 'tweetCtrl.upsert',
  patch: 'tweetCtrl.patch',
  destroy: 'tweetCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var tweetIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './tweet.controller': tweetCtrlStub
});

describe('Tweet API Router:', function() {
  it('should return an express router instance', function() {
    tweetIndex.should.equal(routerStub);
  });

  describe('GET /api/tweets', function() {
    it('should route to tweet.controller.index', function() {
      routerStub.get
        .withArgs('/', 'tweetCtrl.index')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/tweets/:id', function() {
    it('should route to tweet.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'tweetCtrl.show')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/tweets', function() {
    it('should route to tweet.controller.create', function() {
      routerStub.post
        .withArgs('/', 'tweetCtrl.create')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/tweets/:id', function() {
    it('should route to tweet.controller.upsert', function() {
      routerStub.put
        .withArgs('/:id', 'tweetCtrl.upsert')
        .should.have.been.calledOnce;
    });
  });

  describe('PATCH /api/tweets/:id', function() {
    it('should route to tweet.controller.patch', function() {
      routerStub.patch
        .withArgs('/:id', 'tweetCtrl.patch')
        .should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/tweets/:id', function() {
    it('should route to tweet.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'tweetCtrl.destroy')
        .should.have.been.calledOnce;
    });
  });
});
