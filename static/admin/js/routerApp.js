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
		url:'/{menuList:[0-9]{1,3}}',
		views:{
			'':{
				templateUrl:'tmplate/main.html'
			},
			'menuList@main':{
				templateUrl:'tmplate/menuList.html'
			},
			'content':{
				templateUrl:'tmplate/content.html'
			}
		}
	})
});