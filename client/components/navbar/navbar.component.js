'use strict';

export class NavbarComponent {

  constructor(Auth, $http) {
    'ngInject';

    this.isLoggedIn = Auth.isLoggedInSync;
    this.isAdmin = Auth.isAdminSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.$http = $http;
  }

  startStream() {
    this.$http.get('/api/tweets/start-stream');
    console.log('START STREAM');
  }

  stopStream() {
    this.$http.get('/api/tweets/stop-stream');
    console.log('STOP STREAM');
  }

}

export default angular.module('directives.navbar', [])
  .component('navbar', {
    template: require('./navbar.html'),
    controller: NavbarComponent
  })
  .name;
