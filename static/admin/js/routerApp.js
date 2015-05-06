var routerApp = angular.module('routerApp', ['ui.router', 'loginModule']);

routerApp.run(function($rootScope, $state, $stateParams){
	$rootScope.$state = $state;
	$rootScope.$stateParams = $stateParams;
});

routerApp.config(function($stateProvider, $urlRouterProvider){
	$urlRouterProvider.otherwise('/index');

	$stateProvider.state('index', {
		url:'/index',
		views:{
			'':{
				templateUrl:'tmplate/login.html',
				controller:'loginCtroller'
			}
		}
	})
	.state('main', {
		url:'/main',
		views:{
			'':{
				templateUrl:'tmplate/main.html'
			}
		}
	})
});