'use strict';

export default function routes($stateProvider) {
	'ngInject';
	$stateProvider
		.state('hashtags', {
			url: '/hashtags',
			template: '<hashtags></hashtags>'
		});
};
