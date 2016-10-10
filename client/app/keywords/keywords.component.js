'use strict';
import angular from 'angular';

import uiRouter from 'angular-ui-router';

import routes from './keywords.routes';

export class KeywordsComponent {
	/*@ngInject*/
	constructor($http, socket) {
		this.message = 'Hello';
		this.socket = socket;
		this.$http = $http;
		this.keywords = {};
	}

	$onInit() {
		this.$http.get('/api/keywords')
			.then(response => {
				this.keywords = response.data;
        for (var i = 0; i < this.keywords.length; i++) {
          this.keywords[i].link = '/keyword-detail/' + this.keywords[i].text;
        }
				console.log(response.data);
				this.socket.syncUpdates('keyword', this.keywords);
			});
	}
}

export default angular.module('feedbackApp.keywords', [uiRouter])
	.config(routes)
	.component('keywords', {
		template: require('./keywords.html'),
		controller: KeywordsComponent,
		controllerAs: 'vm'
	})
	.name;
