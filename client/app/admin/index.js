'use strict';

import routes from './admin.routes';
import AdminController from './admin.controller';

export default angular.module('feedbackApp.admin', ['feedbackApp.auth', 'ui.router'])
  .config(routes)
  .controller('AdminController', AdminController)
  .name;
