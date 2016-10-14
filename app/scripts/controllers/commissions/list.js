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

function CommissionsListCtrl(
  $q,
  $rootScope,
  $scope,
  $location,
  commissionService,
  storeService
) {
  var vm = this;
  var today = new Date();
  vm.filters = {};
  vm.user = Object.assign({}, $rootScope.user);
  vm.sellers = [];
  $scope.year = today.getFullYear();
  $scope.month = today.getMonth();
  $scope.period = today.getDate() < 16 ? 1: 2;
  setFilterDate($scope.year, $scope.month, $scope.period);
  vm.columns = [
      {key: 'folio', label: 'Folio'},
      {key: 'quotation', label: 'Oportunidad', seeUrl:'http://ventas.miactual.com/quotations/edit/', propId: 'quotation'},
      {key: 'order', label: 'Orden', seeUrl:'http://ventas.miactual.com/checkout/order/', propId: 'order'},
      {key: 'datePayment', label: 'Fecha de pago', date: true },
      {key: 'ammountPayment', label: 'Monto de pago', currency: true},
      {key: 'rate', label: 'Comisión', isRateNormalized: true, rate: true},
      {key: 'ammount', label: 'Monto de comisión', currency: true},
      {key: 'status', label: 'Estatus',  mapper: {paid: 'pagada', pending: 'pendiente'}, color: {paid: 'green', pending: 'red'}},
      {key: 'user.name', label: 'Usuario'},
  ];
  vm.apiResource = commissionService.getCommissions;
  vm.years  = range(new Date().getFullYear(), 1999, -1);
  vm.months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ].map(function(m, i) { return [i, m]; });
  vm.setFilterDate = setFilterDate;
  init();

  function init() {
    if (vm.user.role.name == 'seller') {
      vm.filters.user = vm.user.id;
      totalsSeller();
    } else if (vm.user.role.name == 'store manager') {
      getSellersByStore(vm.user.mainStore.id)
        .then(function(sellers) {
          vm.sellers = sellers;
        });
      totalsSellers();
    }
  }

  function totalsSeller() {
    $scope.$watch(function() {
      return vm.filters && vm.filters.createdAt && vm.filters.createdAt['>='];
    }, function() {
      totalsUser(vm.user.id).then(function(totals){
        vm.user.total = totals.total;
        vm.user.commissions = totals.commissions;
      });
      $rootScope.$broadcast('reloadTable', true);
    });
  }

  function totalsSellers() {
    $scope.$watch(function() {
      return vm.sellers.length && vm.filters && vm.filters.createdAt && vm.filters.createdAt['>='];
    }, function() {
      vm.sellers.map(function(s) {
        s.filters = Object.assign({}, s.filters, vm.filters);
        return s;
      });
      var totals = vm.sellers.map(function(s) {
        console.log('1 asdsadasdasdasdasadas');
        return totalsUser(s.id);
      });
      totals.forEach(function(t, i) {
        console.log('2 asdsadasdasdasdasadas');
        t.then(function(_totals) {
          console.log('3 asdsadasdasdasdasadas');
          vm.sellers[i].commissions = _totals.commissions;
          vm.sellers[i].total = _totals.total;
        });
      });
      $rootScope.$broadcast('reloadTable', true);
    });
  }

  function totalsUser(user) {
    return getTotalByUser(user).then(function(totals) {
      return totals;
    });
  }

  function getSellersByStore(storeId){
    return storeService
      .getSellersByStore(storeId)
      .then(function(res){
        return res.data;
      })
      .then(function(sellers) {
        return sellers.map(function(seller) {
          seller.filters = Object.assign({}, vm.filters, {user: seller.id});
          return seller;
        });
      });
  }

  function getTotalByUser (user) {
    var f = vm.filters.createdAt;
    var dateFrom = f['>='];
    var dateTo = f['<'];
    return commissionService.getTotalByUser(user, dateFrom, dateTo);
  }


  function range(from, to, step) {
    var step   = step || 1;
    var length = Math.abs((to - from) / step);
    var acum   = [];
    for (var i = 0; i < length; i++) {
      acum = acum.concat(from + (i * step));
    }
    return acum;
  }

  function setFilterDate(year, month, period) {
    if (!(year && month && period)) {
      return;
    }
    if (period == 1) {
      var dateFrom = new Date(year, month, 1);
      var dateTo   = new Date(year, month, 16);
    } else {
      var dateFrom = new Date(year, month, 16);
      var dateTo   = setLastDay(new Date(year, month, 1));
    }
    vm.filters.createdAt =  {
      '>=': dateFrom,
      '<': dateTo
    };
  }

  function setLastDay(date) {
    var date = new Date(date);
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }
}
/**
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
      getSellersByStore(vm.user.mainStore.id)
        .then(function(sellers){
          vm.sellers = sellers;
          vm.user.total = sellers.reduce(function(acum, current) {
            return acum + current.total;
         }, 0);
        })
        .then(function() {
          getGoal()
            .then(function(goal) {
              var goal = goal.goal / 2;
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
        });
    } else {
      getTotalByUser(vm.user.id)
        .then(function(res){
          vm.user.total = res.total;
          vm.user.commissions = res.commissions;
        })
        .then(function() {
          getGoal()
            .then(function(goal) {
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
        });
    }
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
              seller.commissions = total.commissions;
              seller.total       = total.total;
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
 * @ngdoc function
 * @name dashexampleApp.controller:CommissionsListCtrl
 * @description
 * # CommissionsListCtrl
 * Controller of the dashexampleApp
 */

