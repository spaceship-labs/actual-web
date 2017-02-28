'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:UsersUserPurchasesCtrl
 * @description
 * # UsersUserPurchasesCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('UsersUserPurchasesCtrl', UsersUserPurchasesCtrl);

function UsersUserPurchasesCtrl(
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