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
  authService,
  storeService
) {
  var vm = this;
  var today = new Date();
  vm.filters = {};
  vm.user = Object.assign({}, $rootScope.user);
  vm.sellers = [];
  vm.USER_ROLES = authService.USER_ROLES;
  
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
  vm.apiResource = setChart;
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
    if (vm.user.role.name === authService.USER_ROLES.SELLER) {
      vm.filters.user = vm.user.id;
      totalsSeller();
    } else if (vm.user.role.name === authService.USER_ROLES.STORE_MANAGER) {
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

  function setChart(page, params) {
    return commissionService
      .getCommissions(page, params)
      .then(function(res) {
        vm.chart = res.data.data.reduce(function(acum, current) {
          var date = moment(current.createdAt).date();
          var index = acum.labels.indexOf(date);
          if (index === -1) {
            acum.labels = acum.labels.concat(date);
            acum.data[acum.labels.length - 1] = current.ammount;
          } else {
            acum.data[index] += current.ammount;
          }
          return acum;
        }, {data: [], labels:[]});
        return res;
      });
  };

}

