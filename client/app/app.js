'use strict';

import angular from 'angular';
// import ngAnimate from 'angular-animate';
import ngCookies from 'angular-cookies';
import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';
import 'angular-socket-io';

import uiRouter from 'angular-ui-router';
import uiBootstrap from 'angular-ui-bootstrap';
import angularMoment from 'angular-moment';

// import ngMessages from 'angular-messages';
//import ngValidationMatch from 'angular-validation-match';


import {
  routeConfig
} from './app.config';

import _Auth from '../components/auth/auth.module';
import account from './account';
import admin from './admin';
import navbar from '../components/navbar/navbar.component';
import footer from '../components/footer/footer.component';
import main from './main/main.component';
import constants from './app.constants';
import util from '../components/util/util.module';
import socket from '../components/socket/socket.service';
import hashtags from './hashtags/hashtags.component';
import keywords from './keywords/keywords.component';
import ngTagModule from './ngTagModule/ngTagModule.directive';

import './app.scss';

angular.module('feedbackApp', [
    // ngAnimate,
    ngCookies, ngResource, ngSanitize, 'btford.socket-io', uiRouter, uiBootstrap,
    angularMoment,

    // ngValidationMatch,
    _Auth, account, admin, navbar, footer, main, hashtags, keywords, ngTagModule, constants,
    socket, util
  ])
  .config(routeConfig)
  .run(function($rootScope, $location, Auth) {
    'ngInject';
    // Redirect to login if route requires auth and you're not logged in

    $rootScope.$on('$stateChangeStart', function(event, next) {
      Auth.isLoggedIn(function(loggedIn) {
        if (next.authenticate && !loggedIn) {
          $location.path('/login');
        }
      });
    });
  });

angular.element(document)
  .ready(() => {
    angular.bootstrap(document, ['feedbackApp'], {
      strictDi: true
    });
  });
