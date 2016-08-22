'use strict';

export default function routes($stateProvider) {
	'ngInject';
	$stateProvider
		.state('keywords', {
			url: '/keywords',
			template: '<keywords></keywords>'
		});
}
