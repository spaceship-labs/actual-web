'use strict';

/**
 * @ngdoc function
 * @name actualWebApp.controller:UsersUserEwalletCtrl
 * @description
 * # UsersUserEwalletCtrl
 * Controller of the actualWebApp
 */
angular.module('actualWebApp')
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