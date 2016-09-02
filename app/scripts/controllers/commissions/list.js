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
  var vm          = this;
  vm.columns      = [
    {key: 'folio', label: 'FOLIO'},
    {key: 'datePayment', label: 'FECHA VENTA', date: true},
    {key: 'ammountPayment', label: 'MONTO COBRADO', currency: true},
    {key: 'rate', label: '% COMISIÓN', rate: true, isRateNormalized: true},
    {key: 'ammount', label: 'MONTO COMISIÓN', currency: true},
    {key: 'ammountPaid', label: 'COMISIÓN PAGADA', currency: true},
    {key: 'ammountLeft', label: 'COMISIÓN PENDIENTE', currency: true},
  ];
  vm.filters      = {user: $rootScope.user.id};
  vm.applyFilters = applyFilters;
  vm.setFromDate  = setFromDate;
  vm.setToDate    = setToDate;
  vm.apiResource  = commissionService.getCommissions;

  function applyFilters(){
    if(vm.dateStart && vm.dateEnd){
      var start  = vm.dateStart;
      var end    = moment(vm.dateEnd).endOf('day');
      vm.filters = Object.assign({}, vm.filters, {
        datePayment: {
          '>=': start,
          '<': end
        }
      });
    }
    $rootScope.$broadcast('reloadTable', true);
  }

  function setFromDate(pikaday){
    vm.dateStart = pikaday._d;
  }


  function setToDate(pikaday){
    vm.dateEnd   = pikaday._d;
  }
}
