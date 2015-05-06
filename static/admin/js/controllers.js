var loginModule = angular.module("loginModule", []);

loginModule.controller('loginCtroller', function($scope, $http, $location, $state, $stateParams){
	$scope.login = function(userInfo){
		console.log(userInfo);
		$http.post('/login', userInfo).success(function(data){
			console.log(data);
			if (data.status == 200)
			{
				window.session = data;
				$location.path('/main');
			}
		}).error(function(error){
			console.log(error);
		});
	}
});