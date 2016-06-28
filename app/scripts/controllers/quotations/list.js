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
  vm.filters = false;

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

  /*
  vm.columnsLeads = [
    {key:'folio', label:'Folio'},
    {key:'client', label:'Cliente'},
    {key:'email', label:'Email'},
    {key:'cotizacion', label:'Cotización'},
    {key:'seguimiento', label:'Seguimiento'},
    {key:'total', label:'Total'},
    {key:'cobrado', label:'Cobrado'},
    {key:'diferencia', label:'Diferencia'},
    {
      key:'Acciones',
      label:'Acciones',
      propId: 'folio',
      actions:[
        {url:'#',type:'edit'},
        {url:'#',type:'delete'}
      ]
    },
  ];
  */
  vm.columnsLeads = [
    {key: 'id', label:'Folio'},
    {key:'CardName', label:'Cliente'},
    {key:'DocTotal', label: 'Total'},
    {key:'DocCur', label:'Moneda'},
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
    console.log($rootScope.user);
    vm.filters = {SlpCode: $rootScope.user.SlpCode};
  }

  vm.init();

}
