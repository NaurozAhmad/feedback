'use strict';

import SignupController from './signup.controller';

export default angular.module('feedbackApp.signup', [])
  .controller('SignupController', SignupController)
  .name;
