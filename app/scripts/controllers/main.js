(function(){

  'use strict';

  /**
   * @ngdoc function
   * @name dashexampleApp.controller:MainCtrl
   * @description
   * # MainCtrl
   * Controller of the dashexampleApp
   */
  function MainCtrl($rootScope, $scope, $location, localStorageService, $q, $timeout, authService){
    var vm = this;
    vm.menuCategoriesOn = false;

    vm.init = function(){
      vm.signIn();
    };

    vm.signIn = function(){
      var formData = {
        email: 'luis19prz@gmail.com',
        password: '1234'
      };

      authService.signIn(formData,
        function(res){
          console.log(res);
          localStorageService.set('token', res.token);
          localStorageService.set('user', res.user);
          console.log(localStorageService);
        },
        function(){
          console.log('Invalid');
        }
      );

    };

    $scope.$on('$routeChangeStart', function(next, current) {
      console.log('$routeChangeStart');
      vm.menuCategoriesOn = false;
    });

    vm.init();

  }

  angular.module('dashexampleApp').controller('MainCtrl', MainCtrl);
  MainCtrl.$inject = ['$rootScope', '$scope', '$location', 'localStorageService', '$q','$timeout', 'authService'];

})();
