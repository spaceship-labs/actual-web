'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:UsersUserPaymentsCtrl
 * @description
 * # UsersUserPaymentsCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('UsersUserPaymentsCtrl', UsersUserPaymentsCtrl);

function UsersUserPaymentsCtrl(
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