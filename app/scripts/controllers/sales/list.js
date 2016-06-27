'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:SalesListCtrl
 * @description
 * # SalesListCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('SalesListCtrl', SalesListCtrl);

function SalesListCtrl($location,$routeParams, $q ,productService, $rootScope, commonService, saleService){

  var vm = this;
  vm.init = init;

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
    {key: 'DocEntry', label:'Folio'},
    {key:'CardName', label:'Cliente'},
    {key:'DocTotal', label: 'Total'},
    {key:'DocCur', label:'Moneda'},
    {
      key:'Acciones',
      label:'Acciones',
      propId: 'DocEntry',
      actions:[
        {url:'#',type:'edit'},
      ]
    },
  ];
  vm.apiResourceOrders = saleService.getList;


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
    vm.filters = {SlpCode: $rootScope.user.SlpCode};
  }

  vm.init();

}
