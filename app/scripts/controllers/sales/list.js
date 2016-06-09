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

function SalesListCtrl($location,$routeParams, $q ,productService, $rootScope, commonService){

  var vm = this;

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
    {key:'folio', label:'Folio'},
    {key:'client', label:'Cliente'},
    {key:'cotizacion', label:'Cotización'},
    {key:'entrega', label:'Entrega'},
    /*{key:'dias', label:'Dias'},*/
    {key:'total', label:'Total'},
    {key:'cobrado', label:'Monto cobrado'},
    {key:'diferencia', label:'Monto diferencia'},
    /*{
      key:'Acciones',
      label:'Acción',
      propId: 'folio',
      actions:[
        {url:'#',type:'edit'},
        {url:'#',type:'delete'}
      ]
    },*/

  ];
  vm.apiResourceOrders = commonService.simulateOrders;

  vm.goal = 6230000;
  vm.current = 5938776;
  vm.rest = vm.goal - vm.current;
  vm.real =  vm.current / (vm.goal/100);

  vm.chartOptions = {
    labels: ["Venta al 28/05/2016", "Falta para el objetivo"],
    data: [vm.current, vm.rest ],
    colours: ["#48C7DB","#EADE56"]
  };


}
