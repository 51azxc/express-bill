define(['./controller-module'], function(app){
	'use strict';
	app.controller('appCtrl', ['$scope', '$mdSidenav', function($scope, $mdSidenav){
	  $scope.toggleSidenav = function(menuId) {
		$mdSidenav(menuId).toggle();
	  };
	}]);
});