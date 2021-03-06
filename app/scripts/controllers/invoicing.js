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
    onPikadaySelect: onPikadaySelect
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
    if ($form.$valid) {
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
}

InvoicingCtrl.$inject = [
  "dialogService",
  "commonService",
  "clientService",
  "invoiceService",
  "$rootScope"
];
