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

function ClientProfileCtrl($location,$routeParams, $rootScope, $timeout, commonService, clientService, quotationService, orderService, dialogService){
  var vm = this;

  angular.extend(vm, {
    activeTab: 0,
    genders: [
      {label:'Masculino', value: 'Masculino'},
      {label: 'Femenino', value: 'Femenino'}
    ],
    titles: [
      {label:'Sr.', value:'Sr'},
      {label:'Sra.', value: 'Sra'},
      {label: 'Srita.', value: 'Srita'}
    ],
    states: commonService.getStates(),
    countries: commonService.getCountries(),
    columnsLeads: [
      {key: 'folio', label:'Folio'},
      {key:'Client.firstName', label:'Cliente'},
      {key:'Client.CardName', label:'Cliente (Nombre SAP)'},
      {key:'total', label: 'Total', currency:true},
      {
        key:'Acciones',
        label:'Acciones',
        propId: 'id',
        actions:[
          {url:'/quotations/edit/',type:'edit'},
        ]
      },
    ],
    columnsOrders: [
      {key: 'folio', label:'Folio'},
      {key:'Client.CardName', label:'Cliente'},
      {key:'total', label: 'Total', currency:true},
      {key:'discount', label:'Descuento', currency:true},
      {
        key:'Acciones',
        label:'Acciones',
        propId: 'id',
        actions:[
          {url:'/order/edit/',type:'edit'},
        ]
      },
    ],
    createQuotation: createQuotation,
    formatContacts: formatContacts,
    init: init,
    onPikadaySelect: onPikadaySelect,
    personalDataToDelivery: personalDataToDelivery,
    updatePersonalData: updatePersonalData,
    apiResourceLeads: quotationService.getByClient,
    apiResourceOrders: orderService.getList,
  });

  function init(){
    vm.isLoading = true;
    clientService.getById($routeParams.id).then(function(res){
      vm.isLoading = false;
      vm.client = res.data;
      vm.client.birthDate = vm.client.birthDate  ? vm.client.birthDate : new Date();
      vm.client.firstName = vm.client.firstName || angular.copy(vm.client.CardName);
      vm.client.phone = vm.client.phone || angular.copy(vm.client.Phone1);
      vm.client.mobilePhone = vm.client.mobilePhone || angular.copy(vm.client.Cellular);
      vm.filtersQuotations = {Client: vm.client.id};
      vm.filtersOrders = {Client: vm.client.id};
      vm.client.Contacts = vm.formatContacts(vm.client);

      /*
      $timeout(function(){
        vm.filter
      }, 100)
      */

      if($location.search().activeTab && $location.search().activeTab < 4){
        vm.activeTab = $location.search().activeTab;
      }

    });
  }

  function onPikadaySelect(pikaday){
    console.log(pikaday);
    vm.client.birthDate = pikaday._d;
  }

  function updatePersonalData(){
    console.log('update');
    vm.isLoading = true;
    var params = {
      //SAP fields
      CardName: vm.client.CardName,
      Phone1: vm.client.Phone1,
      Cellular: vm.client.Cellular,
      //Extrafields
      title: vm.client.title,
      gender: vm.client.gender,
      birthDate: vm.client.birthDate,
      firstName: vm.client.firstName,
      lastName: vm.client.lastName,
      dialCode: vm.client.dialCode,
      phone: vm.client.phone,
      mobileDialCode: vm.client.mobileDialCode,
      mobilePhone: vm.client.mobilePhone,
      E_Mail: vm.client.E_Mail
    }
    clientService.update(vm.client.CardCode, params).then(function (res){
      console.log(res);
      vm.isLoading = false;
      dialogService.showDialog('Datos personales actualizados');
    });
  }

  function createQuotation(){
    var params = {
      User: $rootScope.user.id,
      Client: vm.client.id,
    };
    var goToSearch = true;
    vm.isLoading = true;
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

  function formatContacts(client){
    var contacts = [];
    if(client.Contacts){
      contacts = client.Contacts.map(function(contact){
        contact.firstName = angular.copy(contact.name);
        contact.deliveryStreet = angular.copy(contact.address);
        return contact;
      });
    }
    console.log(client);
    return contacts;
  }

  vm.init();


}
