define([
	'angular',
	'angular-material',
	'angular-router',
	'controllers'
], function(angular){
	return angular.module('myApp', ['ngMaterial', 'ui.router', 'myApp.controllers']);
});