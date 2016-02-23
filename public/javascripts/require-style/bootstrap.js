define([
	'require',
	'angular',
	'angular-animate',
	'angular-aria',
	'angular-material',
	'angular-router',
	'myapp',
	'router'
], function(require, angular){
	'use strict';
	require(['domReady!'], function(document){
		try {
			angular.bootstrap(document, ['myApp']);
		} catch (e) {
			console.error(e.stack || e.message || e);
		}
	});
});