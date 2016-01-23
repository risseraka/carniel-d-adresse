(function(app) {
  'use strict';

  console.log('here')

  app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl',
        controllerAs: 'home'
      })
      .state('map', {
        url: '/map',
        templateUrl: 'views/map.html',
        controller: 'MapCtrl',
        controllerAs: 'map',
        params: {
          private: false
        }
      })
  });

})(angular.module('CarnielApp', ['ui.router']));
