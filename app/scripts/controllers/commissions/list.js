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

function CommissionsListCtrl($rootScope, $location, commissionService) {
  var vm     = this;
  vm.columns = [
    {key: 'id',             label: 'FOLIO COMISION'},
    {key: 'payment.id',     label: 'FOLIO PAGO'},
    {key: 'ammountPayment', label: 'MONTO COBRADO', currency: true},
    {key: 'ammount',        label: 'MONTO COMISIÓN', currency: true},
    {key: 'rate',           label: '% COMISIÓN', rate: true, isRateNormalized: true},
  ];
  vm.filters = {user: $rootScope.user.id};
  vm.apiResource = commissionService.getCommissions;
}
