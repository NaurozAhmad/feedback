'use strict';

describe('Directive: ngTagModule', function() {
  // load the directive's module
  beforeEach(module('feedbackApp.ngTagModule'));

  var element,
    scope;

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function($compile) {
    element = angular.element('<ng-tag-module></ng-tag-module>');
    element = $compile(element)(scope);
    element.text().should.equal('this is the ngTagModule directive');
  }));
});
