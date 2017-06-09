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

function UserProfileCtrl(
  $rootScope, 
  $window, 
  $location, 
  $mdDialog, 
  commonService, 
  clientService,
  authService, 
  localStorageService,
  paymentService
){
  var vm = this;
  angular.extend(vm,{
    user: angular.copy($rootScope.user),
    update: update,
    init: init,
    toggleEditMode: toggleEditMode
  });

  function init(){
  }

  function toggleEditMode(){
    if(vm.isActiveEditMode){
      vm.isActiveEditMode = false;
    }else{
      vm.isActiveEditMode = true;      
    }
  }

  function update(form){
    if(form.$valid){
      /*
      showConfirm().then(function(ok) {
        if (!ok) {return;}
      */
      vm.isLoading = true;
      var cardCode = vm.user.CardCode;
      clientService.update(cardCode,vm.user).then(function(res){
        vm.isLoading = false;
        commonService.showDialog('Datos actualizados');
        if(res.data.id){
          $rootScope.user = res.data;
          vm.user = $rootScope.user;
          localStorageService.set('user',res.data);
        }
      });
      //});
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

  function print(){
    $window.print();
  }

  init();

}
