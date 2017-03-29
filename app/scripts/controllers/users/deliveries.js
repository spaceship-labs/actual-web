'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:UsersUserDeliveriesCtrl
 * @description
 * # UsersUserDeliveriesCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('UsersUserDeliveriesCtrl', UsersUserDeliveriesCtrl);

function UsersUserDeliveriesCtrl(
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