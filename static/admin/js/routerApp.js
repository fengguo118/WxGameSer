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
		templateUrl:'tmplate/main.html'
	})
	.state('main.zhanp', {
		url:'/zhanp',
		templateUrl:'tmplate/content.html'
	})
	.state('main.ggl', {
		url:'/ggl',
		templateUrl:'tmplate/ggl.html'
	})
	.state('main.yyy', {
		url:'/yy',
		templateUrl:'tmplate/yyy.html'
	})
	.state('main.zhanp.info', {
		url:'/info',
		templateUrl:'tmplate/info.html'
	})
});