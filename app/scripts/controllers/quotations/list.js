'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:QuotationsListCtrl
 * @description
 * # QuotationsListCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('QuotationsListCtrl', QuotationsListCtrl);

function QuotationsListCtrl($location,$routeParams, $q ,productService, $rootScope, commonService, quotationService){

  var vm = this;
  vm.init = init;
  vm.applyFilters = applyFilters;
  vm.onDateStartSelect = onDateStartSelect;
  vm.onDateEndSelect = vm.onDateEndSelect;

  vm.filters = false;
  vm.dateEnd = false;

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

  vm.columnsLeads = [
    {key: 'folio', label:'Folio'},
    {key:'Client.CardName', label:'Cliente', defaultValue:'Sin cliente'},
    {key:'total', label: 'Total', currency:true},
    {key:'DocCur', label:'Moneda', defaultValue: 'MXP'},
    {key:'createdAt', label:'Cotización' ,date:true},
    {
      key:'Acciones',
      label:'Acciones',
      propId: 'id',
      actions:[
        {url:'/quotations/edit/',type:'edit'},
      ]
    },
  ];


  vm.apiResourceLeads = quotationService.getList;

  vm.todayQty = 5;
  vm.monthQty = 20;

  vm.todayAmmount = 38542;
  vm.monthAmmount = 257982;

  vm.quantities = {
    labels: ["Hoy", "Resto del mes"],
    data: [vm.todayQty, (vm.monthQty - vm.todayQty) ],
    colours: ["#C92933", "#48C7DB", "#FFCE56"]
  };

  vm.ammounts = {
    labels: ["Hoy", "Resto del mes"],
    data: [vm.todayAmmount, (vm.monthAmmount - vm.todayAmmount) ],
    colours: ["#C92933", "#48C7DB", "#FFCE56"]
  };

  function init(){
    vm.filters = {User: $rootScope.user.id};
    vm.user = $rootScope.user;
  }

  function applyFilters(){
    if(vm.dateStart && vm.dateEnd){
      vm.dateRange = {
        field: 'CreateDate',
        start: vm.dateStart._d,
        end: vm.dateEnd._d
      };
    }
    $rootScope.$broadcast('reloadTable', true);
  }

  function onDateStartSelect(pikaday){
    console.log(pikaday);
  }

  function onDateEndSelect(pikaday){
    console.log(pikaday);
  }


  vm.init();

}
