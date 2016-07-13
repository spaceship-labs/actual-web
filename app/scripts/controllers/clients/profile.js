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

function ClientProfileCtrl($location,$routeParams, $rootScope, $q ,productService, commonService, clientService, quotationService, saleService, dialogService){
  var vm = this;

  vm.init = init;
  vm.update = update;
  vm.createQuotation = createQuotation;
  vm.personalDataToDelivery = personalDataToDelivery;
  vm.onPikadaySelect = onPikadaySelect;

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
    {key: 'folio', label:'Folio'},
    {key:'Client.firstName', label:'Cliente'},
    {key:'Client.CardName', label:'Cliente (Nombre SAP)'},
    {key:'total', label: 'Total', currency:true},
    {key:'currency', label:'Moneda'},
    {
      key:'Acciones',
      label:'Acciones',
      propId: 'id',
      actions:[
        {url:'/quotations/edit/',type:'edit'},
      ]
    },
  ];

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
    vm.isLoading = true;
    clientService.getById($routeParams.id).then(function(res){
      vm.isLoading = false;
      vm.client = res.data;
      vm.client.birthDate = vm.client.birthDate  ? new Date(vm.client.birthDate) : new Date();
      vm.client.firstName = vm.client.firstName || vm.client.CardName;
      vm.client.phone = vm.client.phone || vm.client.Phone1;
      vm.client.mobilePhone = vm.client.mobilePhone || vm.client.Cellular;
      vm.extraParamsLeads = {Client: vm.client.id};
      vm.extraParamsSales = {CardCode: vm.client.id};
    });
  }

  function onPikadaySelect(pikaday){
    console.log(pikaday);
    vm.client.birthDate = pikaday._d;
  }

  function update(){
    vm.isLoading = true;
    var params = angular.copy(vm.client);
    clientService.update(vm.client.id, params).then(function (res){
      vm.isLoading = false;
      dialogService.showDialog('Informacion de cliente actualizada');
    });
  }

  function createQuotation(){
    var params = {
      User: $rootScope.user.id,
      Client: vm.client.id,
    };
    var goToSearch = true;
    quotationService.newQuotation(params, goToSearch);
  }

  function personalDataToDelivery(){
    vm.client.deliveryLastName = vm.client.lastName + ' ' + vm.client.secondLastName;
    vm.relationFields = [
      {deliveryField:'deliveryName', personalField: 'firstName'},
      {deliveryField: 'deliveryDialCode', personalField: 'dialCode'},
      {deliveryField: 'deliveryPhone', personalField: 'phone'},
      {deliveryField: 'deliveryEmail', personalField: 'E_Mail'},
      {deliveryField: 'deliveryMobileDialCode', personalField: 'mobileDialCode'},
      {deliveryField: 'deliveryMobilePhone', personalField: 'mobilePhone'},
      {deliveryField: 'deliveryExternalNumber', personalField: 'externalNumber'},
      {deliveryField: 'deliveryInternalNumber', personalField: 'internalNumber'},
      {deliveryField: 'deliveryNeighborhood', personalField: 'neighborhood'},
      {deliveryField: 'deliveryMunicipality', personalField: 'municipality'},
      {deliveryField: 'deliveryCity', personalField: 'city'},
      {deliveryField: 'deliveryEntity', personalField: 'entity'},
      {deliveryField: 'deliveryZipCode', personalField: 'zipCode'},
      {deliveryField: 'deliveryStreet', personalField: 'street'},
      {deliveryField: 'deliveryStreet2', personalField: 'street2'},
      {deliveryField: 'deliveryReferences', personalField: 'references'},
    ];
    vm.relationFields.forEach(function(relation){
      vm.client[relation.deliveryField] = angular.copy(vm.client[relation.personalField]);
    });
  }

  vm.init();


}
