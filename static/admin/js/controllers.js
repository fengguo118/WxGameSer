var loginModule = angular.module("loginModule", []);

loginModule.controller('loginCtroller', function($scope, $http, $location, $state, $stateParams){
	$scope.login = function(userInfo){
		$http.post('/login', userInfo).success(function(data){
			if (data.message === "login success")
			{
				console.log(data);
				 window.session = data;
				$location.path('/main');
			}
		}).error(function(error){
			console.log(error);
		});
	}
});