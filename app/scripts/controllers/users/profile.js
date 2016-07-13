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

function UserProfileCtrl($rootScope, $scope, $window, $mdDialog, userService){
  var vm    = this;
  vm.user   = $rootScope.user;
  vm.submit = submit;

  function submit() {
    if (!isValid(vm.user)) {
      return;
    }

    showConfirm().then(function(ok) {
      if (!ok) {return;}
      userService.updateMe(vm.user).then(function(res) {
        $window.location.reload();
      });
    });
  }

  function showConfirm() {
    var confirm = $mdDialog.confirm()
      .title('¿Quieres cambiar tus datos?')
      .textContent('Este cambio no es reversible')
      .ok('Sí')
      .cancel('No');
    return $mdDialog.show(confirm);
  }

  function isValid(user) {
    if (user.firstName && user.lastName && user.email == $scope._email) {
      return true;
    }
    return false;
  }
}
