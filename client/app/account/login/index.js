'use strict';

import LoginController from './login.controller';

export default angular.module('feedbackApp.login', [])
  .controller('LoginController', LoginController)
  .name;
