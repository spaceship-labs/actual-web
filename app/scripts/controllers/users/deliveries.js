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
  $q,
  $rootScope, 
  $window, 
  $location, 
  $mdDialog, 
  dialogService,
  commonService,
  clientService,
  userService,
  quotationService,
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
    isCreateModeActive: false,
    isEditModeActive:false,
    copyPersonalDataToNewAddress: copyPersonalDataToNewAddress
  });


  var searchParams = $location.search() || {};
  vm.newAddress = {};
  vm.returnTo = searchParams.returnTo;
  vm.quotationId = searchParams.quotationId;

  init();

  function init(){
    $rootScope.scrollTo('main');
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

  function setNewClientDefaultDataIfNeeded(){
    if(vm.quotationId){
        quotationService.getQuotationZipcodeDelivery(vm.quotationId)
          .then(function(zipcodeDelivery){
            vm.zipcodeDelivery = zipcodeDelivery;
            vm.newAddress.U_CP = vm.zipcodeDelivery.cp;
            vm.newAddress.U_Mpio = vm.zipcodeDelivery.municipio;
            vm.newAddress.U_Estado = getStateCodeByZipcodeDelivery(vm.zipcodeDelivery);
          });
    }
  }

  function getStateCodeByZipcodeDelivery(zipcodeDelivery){
    var zipcodeStateName = (zipcodeDelivery.estado).toUpperCase();
    console.log('zipcodeStateName', zipcodeStateName);
    var stateItem = _.find(vm.states,function(state){
      var stateName = (state.Name).toUpperCase();
      return stateName === zipcodeStateName;
    });
    var stateCode = stateItem ? stateItem.Code : false;
    console.log('stateItem', stateItem);
    return stateCode;
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
        setNewClientDefaultDataIfNeeded();
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
          var createdContact = res;
          if(!(createdContact || {}).id){
            return $q.reject('Hubo un error al agregar la dirección de entrega');
          }

          if(vm.quotationId){
            var params = {addressId: createdContact.id};
            return quotationService.updateAddress(vm.quotationId, params);
          }
          else{
            return $q.resolve();
          }
        })
        .then(function(){
          vm.isLoadingCreate = false;

          if(vm.quotationId){
            $location.path('/checkout/paymentmethod/' + vm.quotationId)
              .search({});
            return;
          }

          if(!vm.returnTo){
            dialogService.showDialog('Dirección registrada');
          }
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
          if(!vm.returnTo){
            dialogService.showDialog('Información  actualizada');
          }
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
    vm.isEditModeActive = true;
    vm.isCreateModeActive = false;
    vm.editAddress = _.clone(address);
    scrollTo('deliveries-edit');
  }

  function enableCreateMode(){
    vm.isCreateModeActive = true;
    vm.isEditModeActive = false;
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