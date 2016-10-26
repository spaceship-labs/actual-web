'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:OrdersListCtrl
 * @description
 * # OrdersListCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('OrdersListCtrl', OrdersListCtrl);

function OrdersListCtrl(
  $filter,
  $location,
  $q ,
  $rootScope,
  $routeParams,
  $timeout,
  authService,
  commonService,
  orderService,
  productService,
  storeService,
  commissionService,
  localStorageService
  ){

  var vm = this;
  vm.applyFilters = applyFilters;
  vm.currentDate = new Date();
  vm.dateRange = false;
  vm.ordersData = {};

  vm.columnsOrders = [
    {key: 'folio', label:'Folio'},
    {key:'Client.CardName', label:'Cliente'},
    {key:'total', label: 'Total', currency:true},
    {key:'ammountPaid', label: 'Monto cobrado', currency:true},
    {key:'createdAt', label:'Venta', date:true},
    {
      key:'Acciones',
      label:'Acciones',
      actions:[
        {url:'/checkout/order/',type:'edit'},
      ]
    },
  ];
  vm.apiResourceOrders = orderService.getList;
  vm.goal = 600000;

  function getOrdersData(){
    var dateRange = {
      startDate: moment().startOf('month'),
      endDate: moment().endOf('day'),
    };

    var promises = [
      getCommisionsGoal(),
      orderService.getTotalsByUser($rootScope.user.id, dateRange)
    ];

    $q.all(promises)
      .then(function(results){
        var commisionResult = results[0];
        var totalsResult = results[1].data;

        vm.current = totalsResult.dateRange || 0;
        vm.goal = commisionResult.goal;
        vm.rest = vm.goal - vm.current;
        vm.currentPercent = 100 - ( vm.current  / (vm.goal / 100) );
        vm.chartOptions = {
          labels: [
            'Venta al ' + $filter('date')(new Date(),'d/MMM/yyyy'),
            'Falta para el objetivo'
          ],
          options:{
            tooltips: {
              callbacks: {
                label: function(tooltipItem, data) {
                  return data.labels[tooltipItem.index] + ': ' + $filter('currency')(data.datasets[0].data[tooltipItem.index]);
                }
              }
            }
          },
          colors: ["#48C7DB","#EADE56"],
          data: [
            vm.current,
            vm.goal - vm.current
          ],
        };
      });
  }

  function init(){
    var fortnightRange = commonService.getFortnightRange();
    vm.startDate = fortnightRange.start.toString();
    vm.endDate = fortnightRange.end.toString();
    vm.isBroker = authService.isBroker($rootScope.user);
    if(vm.isBroker){
      vm.filters = {
        Broker: $rootScope.user.id,
      };
    }else{
      vm.filters = {
        User: $rootScope.user.id,
      };
    }
    vm.dateRange = {
      field: 'createdAt',
      start: vm.startDate,
      end: vm.endDate
    };
    vm.user = $rootScope.user;
    getOrdersData();
    getTotalByDateRange(vm.user.id, {
      startDate: vm.startDate,
      endDate: vm.endDate,
    });
    if(vm.user.role.name == 'store manager' && vm.user.mainCompany){
      getSellersByStore(vm.user.mainCompany.id);
    }
  }

  function getTotalByDateRange(userId, dateRange){
    var params = angular.extend(dateRange, {all:false});
    orderService.getTotalsByUser($rootScope.user.id, params)
      .then(function(res){
        console.log(res);
        vm.totalDateRange = res.data.dateRange || 0;
      })
      .catch(function(err){
        console.log(err);
      });
  }

  function applyFilters(){
    if(vm.dateStart._d && vm.dateEnd._d){
      vm.dateRange = {
        field: 'createdAt',
        start: vm.dateStart._d,
        end: moment(vm.dateEnd._d).endOf('day')
      };
    }

    vm.getTotalByDateRange(vm.user.id, {
      startDate: vm.dateRange.start,
      endDate: vm.dateRange.end,
    });

    updateSellersTotals();

    vm.isLoading = true;
    $timeout(function(){
      vm.isLoading = false;
    },500);
    $rootScope.$broadcast('reloadTable', true);
  }

  function updateSellersTotals(){
    if(vm.sellers){
      var promisesTotals = [];
      for(var i = 0; i< vm.sellers.length; i++){
        var s = vm.sellers[i];
        var params = {
          startDate: vm.dateRange.start,
          endDate: vm.dateRange.end,
          all: false
        };
        promisesTotals.push(orderService.getTotalsByUser(s.id, params));
      }
      $q.all(promisesTotals)
        .then(function(totals){
          console.log(totals);
          vm.sellers = vm.sellers.map(function(s, index){
            s.total = totals[index].data.dateRange;
            return s;
          });
        })
        .catch(function(err){
          console.log(err);
        });
    }
  }

  function getSellersByStore(storeId){
    storeService.getSellersByStore(storeId)
      .then(function(res){
        vm.sellers = res.data;
        var promisesTotals = [];
        vm.sellers = vm.sellers.map(function(s){
          s.filters = {
            User: s.id
          };
          var params = {
            startDate: vm.startDate,
            endDate: vm.endDate,
            all: false
          };
          promisesTotals.push(orderService.getTotalsByUser(s.id, params));
          return s;
        });
        console.log(vm.sellers);
        return $q.all(promisesTotals);
      })
      .then(function(totals){
        vm.sellers = vm.sellers.map(function(s, i){
          s.total = totals[i].data.dateRange;
          return s;
        });
        console.log(vm.sellers);
      })
      .catch(function(err){
        console.log(err);
      });
  }

  function getCommisionsGoal(){
    var fortnightRange = commonService.getFortnightRange();
    var start = moment().startOf('month').toDate();
    var end = moment().endOf('month').toDate();
    var storeId = localStorageService.get('activeStore');
    return commissionService.getGoal(storeId, start, end);
  }

  init();

}
