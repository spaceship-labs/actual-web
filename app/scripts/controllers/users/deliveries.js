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
  dialogService,
  commonService,
  clientService,
  userService,
  $timeout
){
  var vm = this;
  angular.extend(vm,{
    user: angular.copy($rootScope.user),
    createAddress: createAddress,
    updateAddress: updateAddress,
    deleteAddress: deleteAddress,
    edit: edit,
    enableCreateMode: enableCreateMode,
    isCreateModeActive: true,
    copyPersonalDataToNewAddress: copyPersonalDataToNewAddress
  });

  init();

  function init(){
    loadAddresses();
    loadStates();
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

  function loadAddresses(){
    vm.isLoading = true;
    userService.getUserContacts()
      .then(function(res){
        console.log('res', res);
        vm.addresses = res;
        vm.isLoading = false;
      })
      .catch(function(err){
        console.log('err', err);
        vm.isLoading = false;      
      });    
  }

  function loadStates(){
    commonService.getStatesSap()
      .then(function(res){
        console.log(res);
        vm.states = res.data;
      })
      .catch(function(err){
        console.log(err);
      });
  }  

  function createAddress(form){
    vm.isLoadingCreate = true;
    $rootScope.scrollTo('deliveries-create');
    if(form.$valid){
      userService.createUserContact(vm.newAddress)
        .then(function(res){
          console.log('res', res);
          vm.isLoadingCreate = false;
          dialogService.showDialog('Dirección registrada');
          returnToLocationIfneeded();
          vm.newAddress = {};
          loadAddresses();
        })
        .catch(function(err){
          console.log('err', err);
          var errMsg = err.data || err
          dialogService.showDialog(errMsg);
          vm.isLoadingCreate = false;
        });
    }else{
      dialogService.showDialog('Datos incompletos');
    }
  }

  function updateAddress(form, address){
    vm.isLoadingEdit = true;
    $rootScope.scrollTo('deliveries-edit');

    if(form.$valid){
      userService.updateUserContact(address.CntctCode,address)
        .then(function(res){
          console.log('res', res);
          vm.isLoadingEdit = false;
          dialogService.showDialog('Información  actualizada');
          returnToLocationIfneeded();
          loadAddresses();  
        })
        .catch(function(err){
          console.log('err', err);
          var errMsg = err.data || err
          dialogService.showDialog(errMsg);
          vm.isLoadingEdit = false;
        });
    }else{
      dialogService.showDialog('Datos incompletos');
    }
  }

  function deleteAddress(form, address){
    vm.isLoadingEdit = true;
    if(form.$valid){
      userService.deleteAddress(address)
        .then(function(res){
          console.log('res', res);
          vm.isLoadingEdit = false;
          if(res.destroyed){
            dialogService.showDialog('Información eliminada');
            loadAddresses();  
          }
        })
        .catch(function(err){
          console.log('err', err);
          dialogService.showDialog(err);
          vm.isLoadingEdit = false;
        });
    }else{
      dialogService.showDialog('Datos incompletos');
    }
  }

  function edit(address){
    vm.isCreateModeActive = false;
    vm.editAddress = _.clone(address);
    scrollTo('deliveries-edit');
  }

  function enableCreateMode(){
    vm.isCreateModeActive = true;
    scrollTo('deliveries-create');
  }

  function copyPersonalDataToNewAddress(){
    if(!vm.copyingPersonalDataToContact){
      vm.newAddress = vm.newAddress || {};
      vm.newAddress.FirstName = _.clone(vm.client.FirstName);
      vm.newAddress.LastName = _.clone(vm.client.LastName);
      vm.newAddress.Tel1 = _.clone(vm.client.Phone1);
      vm.newAddress.Cellolar = _.clone(vm.client.Cellular);
      vm.newAddress.E_Mail = _.clone(vm.client.E_Mail);
      vm.newAddress._E_Mail = _.clone(vm.client.E_Mail);
    }
    else{
      delete vm.newAddress.FirstName;
      delete vm.newAddress.LastName;
      delete vm.newAddress.Tel1;
      delete vm.newAddress.Cellolar;
      delete vm.newAddress.E_Mail;
      delete vm.newAddress._E_Mail;
    }
  }

  function returnToLocationIfneeded(){
    var searchParams = $location.search() || {};
    if(searchParams.returnTo){
      $rootScope.scrollTo('main');
      $location.path(searchParams.returnTo);
    }
  }

  function scrollTo(target){
    $timeout(
        function(){
          $('html, body').animate({
            scrollTop: $('#' + target).offset().top - 100
          }, 600);
        },
        300
    );
  }  

}