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

function OrdersListCtrl($location,$routeParams, authService, $q ,productService, $rootScope, commonService, orderService, $filter){

  var vm = this;
  vm.init = init;
  vm.applyFilters = applyFilters;
  vm.getOrdersData = getOrdersData;

  vm.currentDate = new Date();
  vm.dateRange = false;
  vm.ordersData = {};
  vm.managers = [
    {
      sellers: [{},{},{},{}]
    },
    {
      sellers: [{},{},{},{}]
    },
    {
      sellers: [{},{},{},{}]
    }
  ];
  vm.columnsOrders = [
    {key: 'folio', label:'Folio'},
    {key:'Client.CardName', label:'Cliente'},
    {key:'total', label: 'Total', currency:true},
    {key:'ammountPaid', label: 'Monto cobrado', currency:true},
    //{key:'currency', label:'Moneda'},
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
    orderService.getTotalsByUser($rootScope.user.id, dateRange)
      .then(function(res){
        vm.current = res.data.dateRange || 0;
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
        }
      });
  }

  function init(){
    var monthRange = commonService.getMonthDateRange();
    vm.startDate = monthRange.start.toString();
    vm.endDate = monthRange.end.toString();
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
    vm.getOrdersData();
  }

  function applyFilters(){
    if(vm.dateStart._d && vm.dateEnd._d){
      vm.dateRange = {
        field: 'createdAt',
        start: vm.dateStart._d,
        end: vm.dateEnd._d
      };
    }
    $rootScope.$broadcast('reloadTable', true);
  }

  vm.init();

}
