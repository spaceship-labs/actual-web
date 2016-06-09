'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:OpportunitiesListCtrl
 * @description
 * # OpportunitiesListCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('OpportunitiesListCtrl', OpportunitiesListCtrl);

function OpportunitiesListCtrl($location,$routeParams, $q ,productService, $rootScope, commonService){

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
  vm.apiResourceLeads = commonService.simulateLeads;

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

}
