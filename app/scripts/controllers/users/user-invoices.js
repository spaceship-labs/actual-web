'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:UsersUserInvoicesCtrl
 * @description
 * # UsersUserInvoicesCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('UsersUserInvoicesCtrl', UsersUserInvoicesCtrl);

function UsersUserInvoicesCtrl(
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