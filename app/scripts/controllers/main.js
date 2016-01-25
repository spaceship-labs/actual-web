(function(){

  'use strict';

  /**
   * @ngdoc function
   * @name dashexampleApp.controller:MainCtrl
   * @description
   * # MainCtrl
   * Controller of the dashexampleApp
   */
  function MainCtrl($rootScope, $scope, $location, $localStorage, AuthService){

    console.log($localStorage);

    function successAuth(res){
      console.log(res);
      $localStorage.token = res.token;
      $localStorage.user = res.user;

      $scope.token = $localStorage.token;
      $scope.user = $localStorage.user;

      $location.path('/home');
    }

    function successRegister(res){
      console.log(res);
      $localStorage.token = res.data.token;
      $localStorage.user = res.data.user;

      $scope.token = $localStorage.token;
      $scope.user = $localStorage.user;
      $location.path('/home');

    }

    $scope.loginData = {};
    $scope.registerData = {};

    $scope.signIn = function(){
      var formData = {
        email: $scope.loginData.email,
        password: $scope.loginData.password
      };

      AuthService.signIn(formData, successAuth, function(){
        $rootScope.error = 'Invalid credentials';
      });
    };

    $scope.signUp = function(){
      var formData = {
        email: $scope.registerData.email,
        password: $scope.registerData.password
      };

      AuthService.signUp(formData, successRegister, function(){
        $rootScope.error = 'Invalid credentials';
      });
    };

    $scope.logout = function () {
      AuthService.logout(function () {
        $location.path('/');
      });
    };

    $scope.token = $localStorage.token;
    $scope.user = $localStorage.user;
    console.log($scope.user);
    //$scope.tokenClaims = AuthService.getTokenClaims();


  }

  angular.module('dashexampleApp').controller('MainCtrl', MainCtrl);
  MainCtrl.$inject = ['$rootScope', '$scope', '$location', '$localStorage', 'AuthService'];

})();
