'use strict';

var myApp = angular.module('myApp',['ngMaterial', 'ngRoute', 'ngMessages', 'ngFileUpload', 'chart.js']);
myApp.run(['$rootScope', '$location', '$route', 'AuthService', 
  function($rootScope, $location, $route, AuthService){
	$rootScope.$on('$routeChangeStart', function(event, next, current){
		if (next!=null && next.data!=null && next.data.requireLogin 
			&& !AuthService.isAuthenticated) {
			$location.path('/signin');
			//$route.reload();
		};
	});

	// var history = [];
	// $rootScope.$on('$routeChangeSuccess', function() {
	// 	console.log($location.url());
	// 	history.push($location.url());
	// });

	// $rootScope.back = function() {
	// 	var prevUrl = history.length > 1 ? history.splice(-2)[0] : "/";
	// 	$location.path(prevUrl);
	// };
	
}]);
myApp.config(['$routeProvider', '$locationProvider', 
  function($routeProvider, $locationProvider){
	$routeProvider
	.when('/', {
		templateUrl: 'partials/show',
		data: { requireLogin: false }
	})
	.when('/signIn', {
		templateUrl: 'partials/signIn',
		controller: 'SignInCtrl',
		data: { requireLogin: false }
	})
	.when('/signUp', {
		templateUrl: 'partials/signUp',
		controller: 'SignUpCtrl',
		data: { requireLogin: false }
	})
	.when('/weeklist', {
		templateUrl: 'partials/weeklist',
		controller: 'WeekListCtrl',
		data: { requireLogin: true }
	})
	.when('/userInfo', {
		templateUrl: 'partials/user',
		controller: 'UserEditCtrl',
		data: { requireLogin: true }
	})
	.when('/createBill', {
		templateUrl: 'partials/bill',
		controller: 'BillCreateCtrl',
		data: { requireLogin: true}
	})
	.when('/editBill/:bid', {
		templateUrl: 'partials/bill',
		controller: 'BillEditCtrl',
		data: { requireLogin: true}
	})
	.when('/daylist', {
		templateUrl: 'partials/daylist',
		controller: 'DayListCtrl',
		reloadOnSearch: false,
		data: { requireLogin: true }
	})
  .when('/daychart', {
		templateUrl: 'partials/daychart',
		controller: 'DayChartCtrl',
		data: { requireLogin: true }
	})
	.otherwise({ redirectTo: '/' });
	// use the HTML5 History API
	$locationProvider.html5Mode(true);
}]);
myApp.config(['$httpProvider', function($httpProvider){
	$httpProvider.interceptors.push('TokenInterceptor');
}]);

myApp.config(['$mdDateLocaleProvider', function($mdDateLocaleProvider) {
  $mdDateLocaleProvider.formatDate = function(date) {
		if (date instanceof Date && !isNaN(date.valueOf())) {
			var y = date.getFullYear().toString();
			var m = (date.getMonth()+1).toString();
			var d = date.getDate().toString();
			return y + '-' + (m[1]?m:"0"+m) + '-' + (d[1]?d:"0"+d);
		}
		return '';
  };
}]);
