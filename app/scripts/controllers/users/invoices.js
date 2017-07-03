'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:UsersUserInvoicesCtrl
 * @description
 * # UsersUserInvoicesCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('UsersUserInvoicesCtrl', UsersUserInvoicesCtrl);

function UsersUserInvoicesCtrl(
  $rootScope,
  orderService,
  commonService,
  clientService,
  dialogService
){
  var vm = this;
  angular.extend(vm,{
    user: angular.copy($rootScope.user),
    apiResourceOrders: orderService.getList,
    fiscalAddressConstraints: clientService.fiscalAddressConstraints,
    columnsOrders: [
      {key: 'folio', label:'Pedido'},
      {key:'createdAt', label:'Fecha del pedido', date:true},
      {key:'total', label: 'Monto', currency:true},
      {key:'total', label: 'Monto facturado', currency:true},
      {
        key:'Acciones',
        label:'Acceder',
        actions:[
          {url:'#',type:'edit'},
        ]
      },
    ],
    updateFiscalAddress:updateFiscalAddress
  });

  init();

  function init(){
    getStates();
    loadFiscalAddress();
  }

  function loadFiscalAddress(){
    vm.isLoading = true;
    clientService.getFiscalAddress(vm.user.CardCode)
      .then(function(res){
        vm.fiscalAddress = res;
        vm.fiscalAddress.LicTradNum = vm.user.LicTradNum;
        vm.isLoading = false;  
      })
      .catch(function(err){
        console.log('err',err);
        vm.isLoading = false;
      })
  }

  function getStates(){
    commonService.getStatesSap()
      .then(function(res){
        console.log(res);
        vm.states = res.data;
      })
      .catch(function(err){
        console.log(err);
      });
  }

  function updateFiscalAddress(form){
    vm.isLoading = true;
    var isValidEmail = commonService.isValidEmail(
      vm.fiscalAddress.U_Correos,
      {excludeActualDomains: true}
    );
    if(form.$valid && isValidEmail){
      var params = _.clone(vm.fiscalAddress);
      params.LicTradNum = _.clone(vm.fiscalAddress.LicTradNum);

      clientService.updateFiscalAddress(
        params.id, 
        vm.user.CardCode,
        params
      )
      .then(function(results){
        vm.isLoading = false;        
        dialogService.showDialog('Datos guardados');
      })
      .catch(function(err){
        vm.isLoading = false;
        console.log(err);
        dialogService.showDialog('Hubo un error al guardar datos de facturación: ' + (err.data || err));
      });
    }else if(!isValidEmail){
      vm.isLoading = false;
      dialogService.showDialog('Email no valido');
    }else{
      vm.isLoading = false;
      dialogService.showDialog('Campos incompletos');
    }

  }

}