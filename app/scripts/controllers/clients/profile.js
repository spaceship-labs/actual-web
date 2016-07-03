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

function ClientProfileCtrl($location,$routeParams, $q ,productService, commonService, clientService, quotationService, saleService){
  var vm = this;

  vm.init = init;
  vm.update = update;

  vm.activeTab = 0;
  vm.titles = [
    {label:'Sr.', value:'Sr'},
    {label:'Sra.', value: 'Sra'},
    {label: 'Srita.', value: 'Srita'}
  ];
  vm.genders = [
    {label:'Masculino', value: 'Masculino'},
    {label: 'Femenino', value: 'Femenino'}
  ];

  vm.states = commonService.getStates();
  vm.countries = commonService.getCountries();

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


  vm.apiResourceLeads = quotationService.getByClient;

  vm.columnsOrders = [
    {key: 'DocEntry', label:'Folio'},
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
  vm.apiResourceOrders = saleService.getList;

  function init(){
    clientService.getById($routeParams.id).then(function(res){
      console.log(res);
      vm.client = res.data;
      vm.client.Info = vm.client.Info || {};
      vm.extraParamsLeads = {CardCode: vm.client.id};
      vm.extraParamsSales = {CardCode: vm.client.id};
    });
  }

  function update(){
    console.log(vm.client);
    vm.isLoading = true;
    clientService.update(vm.client.id, vm.client).then(function (res){
      console.log(res);
      vm.isLoading = false;
    });
  }

  vm.init();


}
