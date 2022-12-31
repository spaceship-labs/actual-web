'use strict';

/**
 * @ngdoc function
 * @name actualWebApp.controller:UsersUserInvoicesCtrl
 * @description
 * # UsersUserInvoicesCtrl
 * Controller of the actualWebApp
 */
angular
  .module('actualWebApp')
  .controller('UsersUserInvoicesCtrl', UsersUserInvoicesCtrl);

function UsersUserInvoicesCtrl(
  $location,
  $rootScope,
  orderService,
  commonService,
  clientService,
  dialogService,
  userService
) {
  var vm = this;
  angular.extend(vm, {
    user: angular.copy($rootScope.user),
    apiResourceOrders: orderService.getList,
    cfdiUseList: clientService.getCFDIUseList(),
    fiscalAddressConstraints: clientService.fiscalAddressConstraints,
    columnsOrders: [
      { key: 'folio', label: 'Pedido' },
      { key: 'createdAt', label: 'Fecha del pedido', date: true },
      { key: 'total', label: 'Monto', currency: true },
      { key: 'total', label: 'Monto facturado', currency: true },
      {
        key: 'Acciones',
        label: 'Acceder',
        actions: [{ url: '#', type: 'edit' }]
      }
    ],
    updateFiscalAddress: updateFiscalAddress,

    CFDIUseListLegalPerson : clientService.getCFDIUseListLegalPerson(),
    CFDIUseListNaturalPerson : clientService.getCFDIUseListNaturalPerson(),
    RegimesLegalPerson : clientService.getRegimesLegalPerson(),
    RegimesNaturalPerson : clientService.getRegimesNaturalPerson(),
    getCFDIUseListSelect : getCFDIUseListSelect,
    getRegimesSelect : getRegimesSelect,

    isGenericRFC : isGenericRFC,
  });

  init();

  function init() {
    getStates();
    loadFiscalAddress();
  }

  function loadFiscalAddress() {
    vm.isLoading = true;
    userService
      .getUserFiscalAddress()
      .then(function(res) {
        vm.fiscalAddress = res;

        console.log("vm.fiscalAddress",vm.fiscalAddress)
        isGenericRFC(vm.fiscalAddress.LicTradNum);

        if (!vm.fiscalAddress.cfdiUse) {
          var lastIndexCfdiUseList = vm.cfdiUseList.length - 1;
          vm.fiscalAddress.cfdiUse = vm.cfdiUseList[lastIndexCfdiUseList].code;
        }

        vm.isLoading = false;
      })
      .catch(function(err) {
        console.log('err', err);
        vm.isLoading = false;
      });
  }

  function getStates() {
    commonService
      .getStatesSap()
      .then(function(res) {
        console.log(res);
        vm.states = res.data;
      })
      .catch(function(err) {
        console.log(err);
      });
  }

  function updateFiscalAddress(form) {
    $rootScope.scrollTo('main');
    vm.isLoading = true;
    var isValidEmail = commonService.isValidEmail(vm.fiscalAddress.U_Correos, {
      excludeActualDomains: true
    });
    if (form.$valid &&
      vm.fiscalAddress.regime &&
      vm.fiscalAddress.regime != null &&
      vm.fiscalAddress.cfdiUse &&
      vm.fiscalAddress.cfdiUse != null
      ) {

      if (!isGenericRFC && !isValidEmail){
        vm.isLoading = false;
        dialogService.showDialog('Email no valido');
        return;
      }

      var params = _.clone(vm.fiscalAddress);
      params.LicTradNum = _.clone(vm.fiscalAddress.LicTradNum);
      params.regime = _.clone(vm.fiscalAddress.regime);
      params.cfdiUse = _.clone(vm.fiscalAddress.cfdiUse);

      userService
        .updateUserFiscalAddress(params)
        .then(function(results) {
          vm.isLoading = false;
          dialogService.showDialog('Datos fiscales guardados');
          returnToLocationIfneeded();
        })
        .catch(function(err) {
          vm.isLoading = false;
          console.log(err);
          dialogService.showDialog(
            'Hubo un error al guardar datos de facturación: ' +
              (err.data || err)
          );
        });
    } else if (!isValidEmail && !isGenericRFC) {
      vm.isLoading = false;
      dialogService.showDialog('Email no valido');
    } else {
      vm.isLoading = false;
      dialogService.showDialog('Campos incompletos');
    }
  }

  function returnToLocationIfneeded() {
    var searchParams = $location.search() || {};
    if (searchParams.returnTo) {
      $rootScope.scrollTo('main');
      $location.path(searchParams.returnTo).search({
        invoiceDataSaved: true
      });
    }
  }

  function getCFDIUseListSelect (rfc) {
    var LicTradNum = rfc;
    if ( LicTradNum ) {
      if ( LicTradNum.length == 12 ) {
        return vm.CFDIUseListLegalPerson;
      }else if ( LicTradNum.length == 13) {
        return vm.CFDIUseListNaturalPerson;
      }
    }
  }

  function getRegimesSelect (rfc) {
    var LicTradNum = rfc;
    if ( LicTradNum ) {
      if ( LicTradNum.length == 12 ) {
        return vm.RegimesLegalPerson;
      }else if ( LicTradNum.length == 13) {
        return vm.RegimesNaturalPerson;
      }
    }
  }

  function isGenericRFC ( rfc ){
    console.log()
    if(rfc){
      if(rfc == clientService.GENERIC_RFC){
        console.log("isGenericRFC = true")
        vm.genericRfc = true;
        vm.fiscalAddress.regime = "SIMPLIFIED_REGIME";
        vm.fiscalAddress.cfdiUse = "S01";
        vm.fiscalAddress.companyName = "PUBLICO EN GENERAL";
        vm.fiscalAddress.ZipCode = "77507";

        return true;
      }else{
        console.log("isGenericRFC = false")
        vm.genericRfc = false;
        return false;
      }
    }
  }
}
