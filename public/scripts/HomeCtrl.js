(function(app) {
  'use strict';

  app.controller('HomeCtrl', function($rootScope, $scope, fileUpload) {
    var home = this;

    home.error = false;
    home.carnet = $rootScope.carnet;

    home.uploadFile = function() {
      fileUpload.uploadFileToUrl($scope.file, '/upload', fileUploaded);
    };

    home.removeContact = function(id) {
      console.log('removing #'+id)
    }

    function fileUploaded(err, response) {
      if (err)
        return home.error = err;
    }
  });

})(angular.module('CarnielApp'));
