'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('keywordDetail', {
      url: '/keyword-detail/:keyword',
      template: '<keyword-detail></keyword-detail>'
    });
}
