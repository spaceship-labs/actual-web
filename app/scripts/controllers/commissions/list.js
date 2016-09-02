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

function CommissionsListCtrl($rootScope, $location, commissionService, storeService) {
  var date        = new Date();
  var first       = new Date(date.getFullYear(), date.getMonth(), 1);
  var mid         = new Date(date.getFullYear(), date.getMonth(), 15);
  var mid2        = new Date(date.getFullYear(), date.getMonth(), 16);
  var last        = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  var vm          = this;
  vm.user         = $rootScope.user;
  vm.sellers      = [];
  vm.columns      = [
    {key: 'folio', label: 'FOLIO'},
    {key: 'datePayment', label: 'FECHA VENTA', date: true},
    {key: 'ammountPayment', label: 'MONTO COBRADO', currency: true},
    {key: 'rate', label: '% COMISIÓN', rate: true, isRateNormalized: true},
    {key: 'ammount', label: 'MONTO COMISIÓN', currency: true},
    {key: 'ammountPaid', label: 'COMISIÓN PAGADA', currency: true},
    {key: 'ammountLeft', label: 'COMISIÓN PENDIENTE', currency: true},
  ];
  vm.dateStart    = date.getDate() <= 15? first.toISOString() : mid2.toISOString();
  vm.dateEnd      = date.getDate() <= 15? mid.toISOString(): last.toISOString();
  vm.filters      = {
    user: vm.user.id,
    datePayment: {
      '>=': vm.dateStart,
      '<': vm.dateEnd
    }
  };
  vm.applyFilters = applyFilters;
  vm.setFromDate  = setFromDate;
  vm.setToDate    = setToDate;
  vm.apiResource  = commissionService.getCommissions;

  init();

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
    init();
  }

  function setFromDate(pikaday){
    vm.dateStart = pikaday._d;
  }

  function setToDate(pikaday){
    vm.dateEnd   = pikaday._d;
  }

  function init() {
    if (vm.user.role.name == 'store manager') {
      getSellersByStore(vm.user.mainStore.id);
    } else {
      getTotalByUser(vm.user.id).then(function(total){
        vm.user.total = total;
      });
    }
  }

  function getSellersByStore(storeId){
    storeService
      .getSellersByStore(storeId)
      .then(function(res){
        return res.data;
      })
      .then(function(res) {
        console.log(res.data);
      });
  }

  function getTotalByUser (user) {
    return commissionService
      .getTotalByUser(user, vm.dateStart, vm.dateEnd);
  }

}
