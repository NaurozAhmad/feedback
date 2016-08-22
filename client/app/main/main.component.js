import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';

export class MainController {

	/*@ngInject*/
	constructor($http, $scope, socket) {
		this.$http = $http;
		this.socket = socket;
		this.startDate = {
			opened: false
		};
		this.endDate = {
			opened: false
		};
		this.query = {
			startDate: null,
			endDate: null
		};

		$scope.$on('$destroy', function() {
			socket.unsyncUpdates('tweet');
		});
	}

	$onInit() {
		this.$http.get('/api/tweets')
			.then(response => {
				this.tweets = response.data;
				console.log(response.data);
				this.socket.syncUpdates('tweet', this.tweets);
			});
	}

	openStartDate() {
		console.log('function called');
		this.startDate.opened = true;
	}

	openEndDate() {
		console.log('function called');
		this.endDate.opened = true;
	}

	search() {
		console.log('called');
		this.$http.get('/api/tweets/search')
			.then(response => {
				console.log(response.data);
			})
	}

	getEmotions() {
		console.log('called');
		this.$http.get('/api/tweets/getEmotions')
			.then(response => {
				console.log(response.data);
			})
	}

	getSentiment() {
		console.log('called');
		this.$http.get('/api/tweets/getSentiment')
			.then(response => {
				console.log(response.data);
			})
	}

	getKeywords() {
		console.log('called');
		this.$http.get('/api/keywords/getKeywords')
			.then(response => {
				console.log(response.data);
			})
	}

}

export default angular.module('feedbackApp.main', [uiRouter])
	.config(routing)
	.component('main', {
		template: require('./main.html'),
		controller: MainController,
		controllerAs: 'main'
	})
	.name;
