import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routes from './hashtags.routes';

export class HashtagsComponent {
	/*@ngInject*/
	constructor($scope, socket, $http) {
		this.message = 'Hello';
		this.newHashtag = '';
		this.socket = socket;
		this.$http = $http;

		$scope.$on('$destroy', function() {
			socket.unsyncUpdates('tweet');
		});
	}

	$onInit() {
		this.$http.get('/api/hashtags')
			.then(response => {
				this.hashtags = response.data;
				this.socket.syncUpdates('hashtag', this.hashtags);
			});
	}

	addHashtag() {
		this.$http.post('/api/hashtags', {name: this.newHashtag})
			.then(response => {
				console.log(response.data);
				this.newHashtag = '';
			});
	}
}

export default angular.module('feedbackApp.hashtags', [uiRouter])
	.config(routes)
	.component('hashtags', {
		template: require('./hashtags.html'),
		controller: HashtagsComponent,
		controllerAs: 'vm'
	})
	.name;
