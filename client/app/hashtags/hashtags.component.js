import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routes from './hashtags.routes';

export class HashtagsComponent {
  /*@ngInject*/
  constructor($scope, socket, $http, Auth) {
    this.message = 'Hello';
    this.newHashtag = '';
    this.Auth = Auth;
    this.socket = socket;
    this.$http = $http;

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('tweet');
    });
  }

  $onInit() {
    var that = this;
    this.Auth.getCurrentUser(user => {
      that.user = user;
	    that.$http.get('/api/hashtags/by-user/' + that.user._id)
	      .then(response => {
	        that.hashtags = response.data;
	        that.socket.syncUpdates('hashtag', that.hashtags);
	      });
    });
  }

  addHashtag() {
    this.$http.post('/api/hashtags', {
        name: this.newHashtag,
        userId: this.user._id
      })
      .then(response => {
        console.log(response.data);
        this.newHashtag = '';
      });
  }

  removeHashtag(id) {
    this.$http.delete('/api/hashtags/' + id)
      .then(response => {
        console.log(response.data);
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
