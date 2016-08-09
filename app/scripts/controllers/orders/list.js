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

function OrdersListCtrl($location,$routeParams, $q ,productService, $rootScope, commonService, orderService){

  var vm = this;
  vm.init = init;
  vm.applyFilters = applyFilters;

  vm.dateRange = false;

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


  vm.goal = 6230000;
  vm.current = 5938776;
  vm.rest = vm.goal - vm.current;
  vm.real =  vm.current / (vm.goal/100);

  vm.chartOptions = {
    labels: ["Venta al 28/05/2016", "Falta para el objetivo"],
    data: [vm.current, vm.rest ],
    colours: ["#48C7DB","#EADE56"]
  };

  function init(){
    var monthRange = commonService.getMonthDateRange();
    vm.startDate = monthRange.start.toString();
    vm.endDate = monthRange.end.toString();
    vm.filters = {
      User: $rootScope.user.id,
    };
    vm.dateRange = {
      field: 'createdAt',
      start: vm.startDate,
      end: vm.endDate
    };
    vm.user = $rootScope.user;
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
