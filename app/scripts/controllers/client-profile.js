'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:ClientProfileCtrl
 * @description
 * # ClientProfileCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('ClientProfileCtrl', ClientProfileCtrl);

function ClientProfileCtrl($location,$routeParams, $q ,productService, commonService){
  var vm = this;

  vm.activeTab = 0;
  vm.titles = [
    {label:'Sr.', value:'Sr'},
    {label:'Sra.', value: 'Sra'},
    {label: 'Srita.', value: 'Srita'}
  ];
  vm.genders = [
    {label:'Masculino', value: 'M'},
    {label: 'Femenino', value: 'F'}
  ];

  vm.states = commonService.getStates();
  vm.countries = commonService.getCountries();

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

  vm.columnsOrders = [
    {key:'folio', label:'Folio'},
    {key:'client', label:'Cliente'},
    {key:'cotizacion', label:'Cotización'},
    {key:'entrega', label:'Entrega'},
    {key:'dias', label:'Dias'},
    {key:'total', label:'Total'},
    {key:'cobrado', label:'Cobrado'},
    {key:'diferencia', label:'Diferencia'},
    {
      key:'Acciones',
      label:'Acción',
      propId: 'folio',
      actions:[
        {url:'#',type:'edit'},
        {url:'#',type:'delete'}
      ]
    },

  ];
  vm.apiResourceOrders = commonService.simulateOrders;



}
