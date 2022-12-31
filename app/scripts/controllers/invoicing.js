"use strict";
angular.module("actualWebApp").controller("InvoicingCtrl", InvoicingCtrl);

function InvoicingCtrl(
  dialogService,
  commonService,
  clientService,
  invoiceService,
  $rootScope
) {
  var vm = this;
  angular.extend(vm, {
    init: init,
    fiscalAddressConstraints: clientService.fiscalAddressConstraints,
    cfdiUseList: clientService.getCFDIUseList(),
    form: {},
    sendFiscalData: sendFiscalData,
    onPikadaySelect: onPikadaySelect,

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
    loadStates();
    var lastIndexCfdiUseList = vm.cfdiUseList.length - 1;
    vm.form.cfdiUse = vm.cfdiUseList[lastIndexCfdiUseList].code;
  }

  function onPikadaySelect(pikaday) {
    vm.form.orderDate = pikaday._d;
  }

  function loadStates() {
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

  function sendFiscalData($form) {
    if ($form.$valid &&
        vm.form.regime &&
        vm.form.regime != null &&
        vm.form.cfdiUse &&
        vm.form.cfdiUse != null
      ) {
      vm.isLoading = true;
      $rootScope.scrollTo("main");
      invoiceService
        .sendFiscalData(vm.email, vm.name, vm.form)
        .then(function(res) {
          if (res.success) {
            dialogService.showDialog("Datos enviados");
            vm.sentData = true;
          } else {
            dialogService.showDialog("Hubo un error al enviar tus datos");
          }

          vm.isLoading = false;
        })
        .catch(function(err) {
          vm.isLoading = false;
          var error = err.data || err;
          error = error ? error.toString() : "";
          dialogService.showDialog("Hubo un error: " + error);
        });
    } else {
      dialogService.showDialog("Datos incompletos, revisa los campos");
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
    if(rfc){
      if(rfc == clientService.GENERIC_RFC){
        vm.genericRfc = true;
        vm.form.regime = "SIMPLIFIED_REGIME";
        vm.form.cfdiUse = "S01";
        vm.form.companyName = "PUBLICO EN GENERAL";
        vm.form.ZipCode = "77507";

        return true;
      }else{
        vm.genericRfc = false;
        return false;
      }
    }
  }
}

InvoicingCtrl.$inject = [
  "dialogService",
  "commonService",
  "clientService",
  "invoiceService",
  "$rootScope"
];
