'use strict';

/**
 * @ngdoc function
 * @name actualWebApp.controller:UserProfileCtrl
 * @description
 * # UserProfileCtrl
 * Controller of the actualWebApp
 */
angular.module('actualWebApp')
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
  userService,
  dialogService
){
  var vm = this;
  console.log('rootScope.user', $rootScope.user);
  angular.extend(vm,{
    user: _.clone($rootScope.user),
    update: update,
    init: init,
    toggleEditMode: toggleEditMode
  });

  function init(){
    vm.isLoading = true;
    userService.getUserClient()
      .then(function(client){
        vm.client = client;
        vm.isLoading = false;
      })
      .catch(function(err){
        console.log('err', err);
        vm.isLoading = false;
      });
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
      vm.isLoading = true;

      userService.update(vm.client).then(function(res){
        vm.isLoading = false;
        commonService.showDialog('Datos actualizados');
        if(res){
          $rootScope.user = res.user;
          vm.user = $rootScope.user;
          vm.client = res.client;
          vm.client._E_Mail = _.clone(vm.client.E_Mail);
          localStorageService.set('user',res.user);
        }
      })
      .catch(function(err){
        vm.isLoading = false;
        console.log(err);
        var error = err.data || err;
        error = error ? error.toString() : '';
        dialogService.showDialog('Hubo un error: ' + error );
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
