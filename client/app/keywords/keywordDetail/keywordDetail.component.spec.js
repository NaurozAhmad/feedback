'use strict';

describe('Component: KeywordDetailComponent', function() {
  // load the controller's module
  beforeEach(module('feedbackApp.keywordDetail'));

  var KeywordDetailComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    KeywordDetailComponent = $componentController('keywordDetail', {});
  }));

  it('should ...', function() {
    1.should.equal(1);
  });
});
