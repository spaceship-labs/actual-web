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

function ClientProfileCtrl(
    $scope,
    $location,
    $routeParams,
    $rootScope,
    $timeout,
    $mdDialog,
    commonService,
    clientService,
    quotationService,
    orderService,
    dialogService
  ){
  var vm = this;

  angular.extend(vm, {
    activeTab: 0,
    genders: [
      {label:'Masculino', value: 'M'},
      {label: 'Femenino', value: 'F'}
    ],
    titles: [
      {label:'Sr.', value:'Sr'},
      {label:'Sra.', value: 'Sra'},
      {label: 'Srita.', value: 'Srita'}
    ],
    states: [],
    countries: commonService.getCountries(),
    columnsLeads: [
      {key: 'folio', label:'Folio'},
      {key:'Client.CardName', label:'Cliente'},
      {key:'Client.E_Mail', label:'Email'},
      {key:'createdAt', label:'Cotización'},
      {key:'total', label: 'Total', currency:true},
      {key:'ammountPaid', label: 'Cobrado', currency:true},
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
      {key:'ammountPaid', label:'Cobrado', currency:true},
      {
        key:'Acciones',
        label:'Acciones',
        propId: 'id',
        actions:[
          {url:'/checkout/order/',type:'edit'},
        ]
      },
    ],
    createQuotation: createQuotation,
    changeTab: changeTab,
    formatContacts: formatContacts,
    onPikadaySelect: onPikadaySelect,
    updatePersonalData: updatePersonalData,
    updateFiscalAddress: updateFiscalAddress,
    apiResourceLeads: quotationService.getByClient,
    apiResourceOrders: orderService.getList,
    updateContact: updateContact,
    createContact: createContact,
    openMapDialog: openMapDialog
  });

  function init(){
    vm.isLoading = true;

    if($location.search().createdClient){
      dialogService.showDialog('Cliente registrado');
    }

    clientService.getById($routeParams.id).then(function(res){
      vm.isLoading = false;
      vm.client = res.data;
      vm.client = formatClient(vm.client);

      if($location.search().activeTab && $location.search().activeTab < 4){
        vm.activeTab = $location.search().activeTab;
      }

      commonService.getStatesSap().then(function(res){
        console.log(res);
        vm.states = res.data;
      }).catch(function(err){
        console.log(err);
      });

    });
  }

  function formatClient(client){
    client.birthDate = client.birthDate  ? client.birthDate : new Date();
    client.firstName = client.firstName || angular.copy(client.CardName);
    client.phone = client.phone || angular.copy(client.Phone1);
    client.mobilePhone = client.mobilePhone || angular.copy(client.Cellular);
    vm.filtersQuotations = {Client: client.id};
    vm.filtersOrders = {Client: client.id};
    client.Contacts = vm.formatContacts(client);    
    return client;
  }  

  function changeTab(index){
    vm.activeTab = index;
    $location.search({activeTab: index});
  }

  function onPikadaySelect(pikaday){
    vm.client.birthDate = pikaday._d;
  }

  function updatePersonalData(){
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
      phone: vm.client.phone,
      mobilePhone: vm.client.mobilePhone,
      E_Mail: vm.client.E_Mail
    };
    clientService.update(vm.client.CardCode, params).then(function (res){
      console.log(res);
      vm.isLoading = false;
      dialogService.showDialog('Datos personales actualizados');
    }).catch(function(err){
      console.log(err);
      dialogService.showDialog('Hubo un error, revisa los campos');
    });
  }

  function updateFiscalAddress(){
    var fiscalAddress = vm.client.FiscalAddresses[0] || {};
    vm.isLoading =  true;
    if(fiscalAddress.id){
      clientService.updateFiscalAddress(fiscalAddress.id, vm.client.CardCode,fiscalAddress)
        .then(function(res){
          console.log(res);
          vm.isLoading = false;
          dialogService.showDialog('Datos de facturación actualizados');
        })
        .catch(function(err){
          console.log(err);
          vm.isLoading = false;
          dialogService.showDialog('Hubo un error, revisa los campos');
        });
    }
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

  function formatFiscalAddresses(client){
    var fiscalAddresses = [];
    if(client.fiscalAddresses){
      fiscalAddresses = client.fiscalAddresses.map(function(address){
        address.email = address.email || angular.copy(client.E_Mail);
        return address;
      });
    }
    return fiscalAddresses;
  }

  function formatContacts(client){
    var contacts = [];
    if(client.Contacts){
      contacts = client.Contacts.map(function(contact){
        contact.FirstName = contact.FirstName || contact.Name;
        contact.street = contact.street || angular.copy(contact.Address);
        contact.E_Mail = contact.E_Mail || angular.copy(client.E_Mail);
        contact.phone = contact.phone || contact.Tel1;
        contact.phone = contact.phone || contact.Tel1;
        contact.mobilePhone = contact.mobilePhone || contact.Cellolar;
        return contact;
      });
    }
    console.log(client);
    return contacts;
  }

  function updateContact(form, contact){
    if(form.$valid){
      contact.isLoading = true;
      var params = _.clone(contact);
      delete params.formWrapper;
      delete params.isLoading;
      clientService.updateContact(
        contact.CntctCode,
        vm.client.CardCode,
        params
      ).then(function(res){
        console.log(res);
        contact.isLoading = false;
        dialogService.showDialog('Dirección de entrega actualizada');
      })
      .catch(function(err){
        console.log(err);
        dialogService.showDialog('Hubo un error');
      });
    }
  }

  function createContact(form){
    if(form.$valid){
      vm.isLoading = true;
      console.log(vm.newContact);
      clientService.createContact(vm.client.CardCode,vm.newContact)
        .then(function(res){
          console.log(res);
          vm.isLoading = false;
          vm.showNewContact = false;
          vm.newContact = {};
          dialogService.showDialog('Dirección creada');
          var created = res.data;
          vm.client.contacts.push(created);
          vm.client.contacts = formatContacts(vm.client);
        })
        .catch(function(err){
          vm.isLoading = false;
          console.log(err);
          dialogService.showDialog('Hubo un error');
        });
    }else{
      dialogService.showDialog('Campos incompletos');
    }
  }

  function openMapDialog(){
    $mdDialog.show({
      controller: ['$scope',MapDialogController],
      templateUrl: 'views/clients/dialog-map.html',
      parent: angular.element(document.body),
      targetEvent: null,
      clickOutsideToClose:true,
    })
    .then(function(answer) {
      $scope.status = 'You said the information was "' + answer + '".';
    }, function() {
      $scope.status = 'You cancelled the dialog.';
    });
  }


  function MapDialogController($scope){
    angular.extend($scope, {
        center: {
          lat: 21.1213286,
          lng: -86.9194812,
          zoom: 6
        },
        defaults: {
          scrollWheelZoom: false
        },
        markers: {
          Madrid: {
              lat: 40.095,
              lng: -3.823,
              focus: true,
              draggable: true
          },
        },
        layers: {
          baselayers: {
              googleRoadmap: {
                  name: 'Google Streets',
                  layerType: 'ROADMAP',
                  type: 'google'
              }
          }
        }
    });
  }

  init();


}
