'use strict';

import {
  UtilService
} from './util.service';

export default angular.module('feedbackApp.util', [])
  .factory('Util', UtilService)
  .name;
