'use strict';

myApp.factory('AuthService', ['$q', '$window', function($q, $window){
	return {
		isAuthenticated: function(){
			if ($window.sessionStorage.token) {
				return true;
			}else{
				return false;
			}
		},
		setToken: function(token){
			$window.sessionStorage.token = token;
		},
		getToken: function(){
			return $window.sessionStorage.token;
		},
		removeToken: function(){
			delete $window.sessionStorage.token;
		}
	};
}]);

myApp.factory('TokenInterceptor', ['$q', '$location', 'AuthService', function($q, $location, AuthService){
	return {
		request: function(config){
			config.headers = config.headers || {};
			if (AuthService.isAuthenticated()) {
				//config.headers['x-access-token'] = AuthService.getToken();
				config.headers.Authorization = 'Bearer ' + AuthService.getToken();
			}
			return config;
		},
		requestError: function(rejection){
			return $q.reject(rejection);
		},
		response: function(response){
			/*
			if (response != null && response.status === 200 
				&& !AuthService.isAuthenticated && AuthService.getToken() ) {
				AuthService.isAuthenticated = true;
			}
			*/
			return response || $q.when(response);
		},
		responseError: function(rejection){
			if (rejection != null && (rejection.status === 401 || rejection.status === 403 ) && AuthService.isAuthenticated() ) {
				AuthService.removeToken();
				//AuthService.isAuthenticated = false;
				$location.path('/signIn');
			}
			return $q.reject(rejection);
		}
	};
}]);

myApp.factory('AlertService', ['$mdToast', '$mdDialog', function($mdToast, $mdDialog){
	return {
		alertToast: function(content, delay){
			return $mdToast.show(
	  	  $mdToast.simple()
	  	  .content(content)
	  	  .position('top right')
	  	  .hideDelay(delay)
	  	);
		},
		confirmToast: function(content){
			return $mdToast.show(
	  	  $mdToast.simple()
	  	  .content(content)
	  	  .position('top right')
	  	  .action('ok')
	  	);
		},
		alertDialog: function(parentId, needClose, title, content){
			var alert = $mdDialog.alert()
				.parent(angular.element(document.querySelector(parentId)))	
				.clickOutsideToClose(needClose)
				.title(title)
				.content(content)
				.ariaLabel('showDialog')
				.ok('OK');
			return $mdDialog.show(alert);
		},
		confirmDialog: function(parentId, needClose, title, content){
			var confirm = $mdDialog.confirm()
				.parent(angular.element(document.querySelector(parentId)))	
				.clickOutsideToClose(needClose)
				.title(title)
				.content(content)
				.ariaLabel('showDialog')
				.ok('OK')
				.cancel('CANCEL');
			return $mdDialog.show(confirm);
		}
	};
}]);

myApp.factory('UserService', ['$q', '$http', 'AuthService', '$window', function($q, $http, AuthService, $window){
	return {
		signIn: function(email, password){
			var deferred = $q.defer();
			$http.post('/api/signIn', { email: email, password: password })
			.then(function(response){
				if(response.status === 200 && response.data.success){
					//AuthService.isAuthenticated = true;
					AuthService.setToken(response.data.token);
					deferred.resolve();
				}else{
					deferred.reject(response);
				}
			}, function(response){
				deferred.reject(response);
			});
			return deferred.promise;
		},
		signUp: function(email, password){
			var deferred = $q.defer();
			$http.post('/api/signup', { email: email, password: password })
			.then(function(response){
				if(response.status === 200 && response.data.success){
					deferred.resolve(response);
				}else{
					deferred.reject(response);
				}
			}, function(response){
				deferred.reject(response);
			});
			return deferred.promise;
		},
		getUser: function(){
			return $http.get('/api/users/me');
		},
		saveUser: function(user){
			return $http.put('/api/users/save', {user: user});
		},
		saveSessionUser: function(user){
			$window.sessionStorage.nickname = user.nickname;
			$window.sessionStorage.avatar = user.avatar;
		},
		getSessionUser: function(){
			var user = { 'nickname': $window.sessionStorage.nickname, 'avatar': $window.sessionStorage.avatar };
			return user;
		},
		removeSessionUser: function(){
			delete $window.sessionStorage.nickname;
			delete $window.sessionStorage.avatar;
		}
	};
}]);

myApp.factory('BillService', ['$q', '$http', 'AuthService', function($q, $http, AuthService){
	return {
		weekList: function(){
			return $http.get('/api/bills/find');
		},
		addBill: function(bill){
			return $http.post('/api/bills/add', { bill:bill });
		},
		oneBill: function(id){
			return $http.get('/api/bills/find/'+id);
		},
		editBill: function(bid, bill, delImages, saveImages){
			return $http.put('/api/bills/modify/'+bid, { bill:bill, delImages: delImages, saveImages:saveImages});
		},
		deleteBill: function(bid){
			return $http.delete('/api/bills/delete/'+bid);
		},
		todayList: function(){
			return $http.get('/api/bills/day');
		},
		dayList: function(params) {
			return $http.get('/api/bills/day', {
				params: params
			});
		},
	    lineChart: function(params) {
	      return $http.get('/api/bills/lineChart', {
					params: params
				}); 
	    },
	    barChart: function(params) {
	      return $http.get('/api/bills/barChart', {
					params: params
				}); 
	    },
	    arcChart: function(params) {
	      return $http.get('/api/bills/arcChart', {
					params: params
				}); 
	    },
	    pieChart: function(params) {
	      return $http.get('/api/bills/pieChart', {
					params: params
				}); 
	    },
	    exportData: function(params) {
	      return $http.get('/api/bills/excel', {
					params: params
				}); 
	    }
	};
}]);