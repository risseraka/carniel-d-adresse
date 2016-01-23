(function(app) {
  'use strict';

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

  // Lancement de l'app
  app.run(function($rootScope, $http) {

    $rootScope.carnet = [];

    $http.get('/api/contacts')
      .then(function(response) {
        $rootScope.carnet = response.data.contacts;
      });
  });

  // https://uncorkedstudios.com/blog/multipartformdata-file-upload-with-angularjs
  app.directive('fileModel', ['$parse', function ($parse) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var model = $parse(attrs.fileModel);
        var modelSetter = model.assign;

        element.bind('change', function(){
          scope.$apply(function(){
            modelSetter(scope, element[0].files[0]);
          });
        });
      }
    };
  }])
  .service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(file, uploadUrl, cb){
      var fd = new FormData();
      fd.append('file', file);
      $http.post(uploadUrl, fd, {
        transformRequest: angular.identity,
        headers: {'Content-Type': undefined}
      })
      .success(function(data){
        console.log(data)
        cb(null, data);
      })
      .error(function(err){
        console.log('oups')
        cb(err);
      });
    }
  }]);

})(angular.module('CarnielApp', ['ui.router']));
