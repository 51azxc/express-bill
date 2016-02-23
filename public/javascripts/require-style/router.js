define(['myapp'], function(app){
	return app
	.run(['$rootScope', '$state', '$stateParams', function($rootScope, $state, $stateParams){
		$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
			if (toState.data.requireLogin) {
				$state.go('show');
			};
		});
	}])
	.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$uiViewScrollProvider', 
	function($stateProvider, $urlRouterProvider, $locationProvider, $uiViewScrollProvider){
		$locationProvider.html5Mode(true);
		//用于改变state时跳至顶部
		$uiViewScrollProvider.useAnchorScroll();
		// 默认进入先重定向
		$urlRouterProvider.otherwise('/');
		$stateProvider
		.state('show', {
			url: '/',
			tempalteUrl: '/partials/show',
			/*
			views: {
				'rightSide': {
					tempalteUrl: '/partials/show.html'
				},
			},
			*/
			data: { requireLogin: false }
		})
		.state('home', {
			views: {
				'leftSide': {
					tempalteUrl: '/partials/menu.html',
					controller: 'menuCtrl'
				},
				'rightSide': {
					tempalteUrl: '/partials/content.html'
				}
			},
			data: { requireLogin: true }
		})
		.state('signin', {
			views: {
				'rightSide': {
				tempalteUrl: '/partials/signin.html',
					controller: 'signinCtrl',
				}
			},
			data: { requireLogin: false }
		})
		.state('signup', {
			views: {
				'rightSide': {
					tempalteUrl: '/partials/signup.html',
					controller: 'signupCtrl',
				}
			},
			data: { requireLogin: false }
		})
		.state('signout', {
			url: '/signout',
			controller: 'signinCtrl',
			data: { requireLogin: true }
		})
	}]);
});