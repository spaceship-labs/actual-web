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
