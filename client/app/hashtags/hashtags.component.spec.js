'use strict';

describe('Component: HashtagsComponent', function() {
  // load the controller's module
  beforeEach(module('feedbackApp.hashtags'));

  var HashtagsComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    HashtagsComponent = $componentController('hashtags', {});
  }));

  it('should ...', function() {
    1.should.equal(1);
  });
});
