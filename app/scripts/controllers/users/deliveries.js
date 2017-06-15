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
  userService,
  commonService,
  clientService,
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
  });

  init();

  function init(){
    loadAddresses();
    loadStates();
  }

  function loadAddresses(){
    vm.isLoading = true;
    clientService.getContacts(vm.user.CardCode)
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
    if(form.$valid){
      clientService.createContact(vm.user.CardCode,vm.newAddress)
        .then(function(res){
          console.log('res', res);
          vm.isLoadingCreate = false;
          dialogService.showDialog('Dirección registrada');
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
    if(form.$valid){
      clientService.updateContact(address.CntctCode,vm.user.CardCode,address)
        .then(function(res){
          console.log('res', res);
          vm.isLoadingEdit = false;
          dialogService.showDialog('Información  actualizada');
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