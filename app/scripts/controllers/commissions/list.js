'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:CommissionsListCtrl
 * @description
 * # CommissionsListCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('CommissionsListCtrl', CommissionsListCtrl);

function CommissionsListCtrl($location, commissionService) {
  var vm     = this;
  vm.columns = [
    {key: 'id',             label: 'FOLIO COMISION'},
    {key: 'payment.id',     label: 'FOLIO PAGO'},
    {key: 'paymentAmmount', label: 'MONTO COBRADO'},
    {key: 'ammount',        label: 'MONTO COMISIÓN'},
    {key: 'rate',           label: '% COMISIÓN'},
    {key: 'ammount',        label: 'MONTO COMISIÓN'},
  ];
  vm.apiResource = commissionService.getCommissions;
}
