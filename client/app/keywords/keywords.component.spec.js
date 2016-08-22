'use strict';

describe('Component: KeywordsComponent', function() {
	// load the controller's module
	beforeEach(module('feedbackApp.keywords'));

	var KeywordsComponent;

	// Initialize the controller and a mock scope
	beforeEach(inject(function($componentController) {
		KeywordsComponent = $componentController('keywords', {});
	}));

	it('should ...', function() {
		1. should.equal(1);
	});
});
