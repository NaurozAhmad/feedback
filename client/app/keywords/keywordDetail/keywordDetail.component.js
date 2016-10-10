'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './keywordDetail.routes';

export class KeywordDetailComponent {
  /*@ngInject*/
  constructor($stateParams) {
    this.message = 'Hello';
    this.params = $stateParams
  }

  $onInit() {
    console.log('KEYWORD IS ', this.params.keyword);
  }
}

export default angular.module('feedbackApp.keywordDetail', [uiRouter])
  .config(routes)
  .component('keywordDetail', {
    template: require('./keywordDetail.html'),
    controller: KeywordDetailComponent,
    controllerAs: 'keywordDetailCtrl'
  })
  .name;
