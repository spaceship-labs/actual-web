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
    updateFiscalAddress: updateFiscalAddress
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
    if (form.$valid && isValidEmail) {
      var params = _.clone(vm.fiscalAddress);
      params.LicTradNum = _.clone(vm.fiscalAddress.LicTradNum);

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
    } else if (!isValidEmail) {
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
}
