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

function UserProfileCtrl($rootScope, $location, $mdDialog, commonService, userService, localStorageService){
  var vm = this;
  vm.user = angular.copy($rootScope.user);
  vm.update = update;

  if(vm.user.userType == 'broker'){
    $location.path('/users/brokerprofile');
  }

  function update(form){
    console.log('update');
    if(form.$valid){
      showConfirm().then(function(ok) {
        if (!ok) {return;}
        vm.isLoading = true;
        userService.update(vm.user).then(function(res){
          vm.isLoading = false;
          commonService.showDialog('Datos actualizados');
          if(res.data.id){
            $rootScope.user = res.data;
            vm.user = $rootScope.user;
            localStorageService.set('user',res.data);
          }
        });
      });
    }
  }

  function showConfirm() {
    var confirm = $mdDialog.confirm()
      .title('¿Quieres cambiar tus datos?')
      .textContent('Este cambio no es reversible')
      .ok('Sí')
      .cancel('No');
    return $mdDialog.show(confirm);
  }

}
