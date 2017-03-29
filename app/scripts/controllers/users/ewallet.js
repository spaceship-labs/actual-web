'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:UsersUserEwalletCtrl
 * @description
 * # UsersUserEwalletCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('UsersUserEwalletCtrl', UsersUserEwalletCtrl);

function UsersUserEwalletCtrl(
  $rootScope, 
  $window, 
  $location, 
  $mdDialog, 
  commonService, 
  userService,
  authService, 
  localStorageService,
  paymentService
){
  var vm = this;
  angular.extend(vm,{
    user: angular.copy($rootScope.user),
  });

}