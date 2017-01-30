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
  vm.isUserAdminOrManager = authService.isUserAdminOrManager;
  vm.isUserSellerOrAdmin  = authService.isUserSellerOrAdmin; 

  vm.currentDate = new Date();
  vm.dateRange = false;
  vm.ordersData = {};
  vm.listScopes = [];
  vm.columnsOrders = [
    {key: 'folio', label:'Folio'},
    {key:'Client.CardName', label:'Cliente'},
    {key:'total', label: 'Total', currency:true},
    {key:'ammountPaid', label: 'Monto cobrado', currency:true},
    {key:'createdAt', label:'Venta', date:true},
    {
      key:'Acciones',
      label:'Acceder',
      actions:[
        {url:'/checkout/order/',type:'edit'},
      ]
    },
  ];
  vm.apiResourceOrders  = orderService.getList;
  vm.getFortnightNumber = getFortnightNumber;
  vm.getStoreTotal      = getStoreTotal;
  vm.goal = 600000; 


  function getOrdersData(options){
    options = options || {};
    var dateRange = {
      startDate: moment().startOf('day'),
      endDate: moment().endOf('day'),
    };

    var promises = [
      getCommisionsGoal(),
    ];

    if(!options.sellers){
      promises.push(
        orderService.getTotalsByUser($rootScope.user.id, dateRange)
      );
    }

    $q.all(promises)
      .then(function(results){
        var commisionResult = results[0];
        var totalsResult;

        if(options.sellers){
          vm.current = getStoreTotal(options.sellers);
        }else{
          totalsResult = results[1].data;
          vm.current = totalsResult.fortnight || 0;
        }

        if(vm.user.role.name === authService.USER_ROLES.STORE_MANAGER){
          vm.goal = (commisionResult.goal / 2);
        }else{
          vm.goal = (commisionResult.goal / 2) / commisionResult.sellers;          
        }
        
        vm.remaining = vm.goal - vm.current;
        vm.currentPercent = 100 - ( vm.remaining  / (vm.goal / 100) );
        vm.chartOptions = {
          labels: [
            'Venta al ' + $filter('date')(new Date(),'d/MMM/yyyy'),
            'Falta para el objetivo'
          ],
          options:{
            tooltips: {
              callbacks: {
                label: commonService.getCurrencyTooltip
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
      vm.listScopes = [
        {label: 'Mis ventas', value: $rootScope.user.id},
        {label: 'Todas las ventas', value:'none'}
      ];      
    }
    vm.dateRange = {
      field: 'createdAt',
      start: vm.startDate,
      end: vm.endDate
    };
    vm.user = $rootScope.user;

    if(vm.user.role.name === authService.USER_ROLES.STORE_MANAGER && vm.user.mainStore){
      getSellersByStore(vm.user.mainStore.id);
    }
    else{
      getOrdersData();
      getTotalByDateRange(vm.user.id, {
        startDate: vm.startDate,
        endDate: vm.endDate,
      });

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

    getTotalByDateRange(vm.user.id, {
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
          setupStoreCharts(vm.sellers);
          getOrdersData({
            sellers: vm.sellers
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
        var promisesTotals = [];
        vm.sellers = res.data;
        console.log('vm.sellers', vm.sellers);
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
        setupStoreCharts(vm.sellers);
        getOrdersData({
          sellers: vm.sellers
        });

      })
      .catch(function(err){
        console.log(err);
      });
  }

  function setupStoreCharts(sellers){
    vm.store = {};
    vm.store.ammounts = {
      total: sellers.reduce(function(acum,seller){return acum+=seller.total;},0),
      labels: sellers.map(function(seller){return seller.firstName + ' ' + seller.lastName;}),
      data: sellers.map(function(seller){return seller.total;}),
      options:{
        legend:{
          display:true,
          position: 'bottom'
        },
        tooltips: {
          callbacks: {
            label: commonService.getCurrencyTooltip
          }
        }
      },
    };  
  }  

  function getCommisionsGoal(){
    var fortnightRange = commonService.getFortnightRange();
    var start = moment().startOf('month').toDate();
    var end = moment().endOf('month').toDate();
    var storeId = localStorageService.get('activeStore');
    return commissionService.getGoal(storeId, start, end);
  }

  function getFortnightNumber(){
    var number = 1;
    var day = moment().format('D');
    if(day > 15){
      number = 2;
    }
    return number;
  }

  function getStoreTotal(sellers){
    var total = sellers.reduce(function(acum, seller){
      acum += seller.total;
      return acum;
    },0);
    return total;
  }

  init();

}
