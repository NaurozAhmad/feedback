'use strict';

export default class LoginController {

  /*@ngInject*/
  constructor(Auth, $state, $http) {
    this.Auth = Auth;
    this.$http = $http;
    this.$state = $state;
  }

  login(form) {
    this.submitted = true;

    if (form.$valid) {
      var that = this;
      this.Auth.login({
          email: this.user.email,
          password: this.user.password
        })
        .then(() => {
          // Logged in, redirect to home
          that.Auth.getCurrentUser(function(user) {
            if (user) {
              that.$http.get('/api/tweets/start/' + user._id);
              that.$state.go('main');
            }
          });
        })
        .catch(err => {
          this.errors.login = err.message;
        });
    }
  }
}
