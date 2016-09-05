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

function CommissionsListCtrl($q, $rootScope, $location, commissionService, storeService) {
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
  vm.dateStart    = date.getDate() <= 15? first : mid2;
  vm.dateEnd      = date.getDate() <= 15? mid : last;
  vm.filters      = {
    user: vm.user.id,
    datePayment: {
      '>=': vm.dateStart,
      '<': vm.dateEnd
    }
  };
  vm.chart        = {
    data: [30, 70],
    labels: ['vendido', 'faltante'],
    colors: ['#C92933', '#48C7DB', '#FFCE56']
  };
  vm.applyFilters = applyFilters;
  vm.setFromDate  = setFromDate;
  vm.setToDate    = setToDate;
  vm.apiResource  = commissionService.getCommissions;

  init();

  function applyFilters(){
    if(vm.dateStart && vm.dateEnd){
      var start  = moment(vm.dateStart);
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
      getSellersByStore(vm.user.mainStore.id).then(function(sellers){
        vm.sellers = sellers;
      });
    } else {
      getTotalByUser(vm.user.id).then(function(res){
        vm.user.total = res.total;
        vm.user.commissions = res.commissions;
      });
    }
    getGoal().then(function(goal) {
      var goal = goal.goal / goal.sellers / 2;
      var labels = [
        'vendido',
        (vm.user.total >  goal && 'superado') || 'faltante'
      ];
      vm.chart        = {
        data: [vm.user.total, Math.abs(vm.user.total - goal)],
        labels: labels,
        colors: ['#C92933', '#48C7DB', '#FFCE56']
      };
    });
  }

  function getSellersByStore(storeId){
    return storeService
      .getSellersByStore(storeId)
      .then(function(res){
        return res.data;
      })
      .then(function(sellers) {
        return sellers.reduce(function(promise, seller) {
          return promise.then(function(sellers) {
            return getTotalByUser(seller.id).then(function(total) {
              seller.total = total;
              return sellers.concat(seller);
            });
          });
        }, $q.when([]));
      })
      .then(function(sellers) {
        return sellers.map(function(seller) {
          seller.filters = Object.assign({}, vm.filters, {user: seller.id});
          return seller;
        });
      });
  }

  function getTotalByUser (user) {
    return commissionService.getTotalByUser(user, vm.dateStart, vm.dateEnd);
  }

  function getGoal() {
    return commissionService.getGoal(vm.user.mainStore.id, vm.dateStart, vm.dateEnd).then(function(goal) {
      vm.goal = goal;
      return goal;
    });
  }
}
