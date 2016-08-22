'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var hashtagCtrlStub = {
  index: 'hashtagCtrl.index',
  show: 'hashtagCtrl.show',
  create: 'hashtagCtrl.create',
  upsert: 'hashtagCtrl.upsert',
  patch: 'hashtagCtrl.patch',
  destroy: 'hashtagCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var hashtagIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './hashtag.controller': hashtagCtrlStub
});

describe('Hashtag API Router:', function() {
  it('should return an express router instance', function() {
    hashtagIndex.should.equal(routerStub);
  });

  describe('GET /api/hashtags', function() {
    it('should route to hashtag.controller.index', function() {
      routerStub.get
        .withArgs('/', 'hashtagCtrl.index')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/hashtags/:id', function() {
    it('should route to hashtag.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'hashtagCtrl.show')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/hashtags', function() {
    it('should route to hashtag.controller.create', function() {
      routerStub.post
        .withArgs('/', 'hashtagCtrl.create')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/hashtags/:id', function() {
    it('should route to hashtag.controller.upsert', function() {
      routerStub.put
        .withArgs('/:id', 'hashtagCtrl.upsert')
        .should.have.been.calledOnce;
    });
  });

  describe('PATCH /api/hashtags/:id', function() {
    it('should route to hashtag.controller.patch', function() {
      routerStub.patch
        .withArgs('/:id', 'hashtagCtrl.patch')
        .should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/hashtags/:id', function() {
    it('should route to hashtag.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'hashtagCtrl.destroy')
        .should.have.been.calledOnce;
    });
  });
});
