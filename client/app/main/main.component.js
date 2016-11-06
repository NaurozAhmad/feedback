import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';

export class MainController {

  /*@ngInject*/
  constructor($http, $scope, socket) {
    this.$http = $http;
    this.socket = socket;
    this.sentiment = 0;
    this.startDate = {
      opened: false
    };
    this.endDate = {
      opened: false
    };
    this.query = {
      startDate: null,
      endDate: null
    };

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('tweet');
    });
  }

  $onInit() {
    $('.ui.radio.checkbox').checkbox();
    this.$http.get('/api/tweets')
      .then(response => {
        this.tweets = response.data;
        this.tweetsToShow = JSON.parse(JSON.stringify(this.tweets));
        console.log(this.tweetsToShow);
        this.socket.syncUpdates('tweet', this.tweets);
      });
  }

  openStartDate() {
    console.log('function called');
    this.startDate.opened = true;
  }

  openEndDate() {
    console.log('function called');
    this.endDate.opened = true;
  }

  search() {
    console.log('called');
    this.$http.get('/api/tweets/search')
      .then(response => {
        console.log(response.data);
      });
  }

  getEmotions() {
    console.log('called');
    this.$http.get('/api/tweets/getEmotions')
      .then(response => {
        console.log(response.data);
      });
  }

  getSentiment() {
    console.log('called');
    this.$http.get('/api/tweets/getSentiment')
      .then(response => {
        console.log(response.data);
      });
  }

  getKeywords() {
    console.log('called');
    this.$http.get('/api/keywords/getKeywords')
      .then(response => {
        console.log(response.data);
      });
  }

  showSentiment(type) {
    console.log('Filtering by sentiment');
    if (type === 0) {
      this.sentiment = 0;
      this.tweetsToShow = JSON.parse(JSON.stringify(this.tweets));
    } else if (type === 1) {
      this.sentiment = 1;
      this.tweetsToShow = [];
      for (var i = 0; i < this.tweets.length; i++) {
        if (this.tweets[i].sentiment.score > 0) {
          this.tweetsToShow.push(this.tweets[i]);
        }
      }
    } else if (type === 2) {
      this.sentiment = 2;
      this.tweetsToShow = [];
      for (var i = 0; i < this.tweets.length; i++) {
        if (this.tweets[i].sentiment.score < 0) {
          this.tweetsToShow.push(this.tweets[i]);
        }
      }
    }
  }

}

export default angular.module('feedbackApp.main', [uiRouter])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController,
    controllerAs: 'main'
  })
  .name;
