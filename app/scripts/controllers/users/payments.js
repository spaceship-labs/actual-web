'use strict';

/**
 * @ngdoc function
 * @name actualWebApp.controller:UsersUserPaymentsCtrl
 * @description
 * # UsersUserPaymentsCtrl
 * Controller of the actualWebApp
 */
angular.module('actualWebApp')
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