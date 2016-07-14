'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:UserProfileCtrl
 * @description
 * # UserProfileCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('UserProfileCtrl', UserProfileCtrl);

function UserProfileCtrl($rootScope, $location, commonService, userService, localStorageService){
  var vm = this;
  vm.user = angular.copy($rootScope.user);
  vm.update = update;

  if(vm.user.userType == 'broker'){
    $location.path('/users/brokerprofile');
  }

  function update(form){
    if(form.$valid){
      vm.isLoading = true;
      userService.update(vm.user).then(function(res){
        vm.isLoading = false;
        console.log(res);
        commonService.showDialog('Datos actualizados');
        if(res.data.id){
          $rootScope.user = res.data;
          localStorageService.set('user',res.data);
        }
      });
    }
  }

}
