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
      {label:'Masculino', value: 'M'},
      {label: 'Femenino', value: 'F'}
    ],
    titles: [
      {label:'Sr.', value:'Sr'},
      {label:'Sra.', value: 'Sra'},
      {label: 'Srita.', value: 'Srita'}
    ],
    states: [],
    //states: commonService.getStates(),
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
          {url:'/order/edit/',type:'edit'},
        ]
      },
    ],
    createQuotation: createQuotation,
    changeTab: changeTab,
    formatContacts: formatContacts,
    init: init,
    onPikadaySelect: onPikadaySelect,
    updatePersonalData: updatePersonalData,
    updateFiscalInfo: updateFiscalInfo,
    apiResourceLeads: quotationService.getByClient,
    apiResourceOrders: orderService.getList,
    updateContact: updateContact,
    createContact: createContact
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
      console.log(vm.client);
      /*
      $timeout(function(){
        vm.filter
      }, 100)
      */

      if($location.search().activeTab && $location.search().activeTab < 4){
        vm.activeTab = $location.search().activeTab;
      }

      commonService.getStatesSap().then(function(res){
        console.log(res);
        vm.states = res.data;
      }).catch(function(err){
        console.log(err);
      })

    });
  }

  function changeTab(index){
    vm.activeTab = index;
    $location.search({activeTab: index});
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
    }).catch(function(err){
      console.log(err);
      dialogService.showDialog('Hubo un error, revisa los campos');
    });
  }

  function updateFiscalInfo(){
    var params = vm.client.FiscalInfo[0] || {};
    vm.isLoading =  true;
    clientService.updateFiscalInfo(vm.client.FiscalInfo[0].id, vm.client.CardCode,params)
      .then(function(res){
        console.log(res);
        vm.isLoading = false;
        dialogService.showDialog('Datos de facturación actualizados');
      })
      .catch(function(err){
        console.log(err);
        vm.isLoading = false;
        dialogService.showDialog('Hubo un error, revisa los campos');
      })
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

  function formatFiscalInfo(client){
    var fiscalInfo = [];
    if(client.fiscalInfo){
      fiscalInfo = client.fiscalInfo.map(function(info){
        info.email = info.email || angular.copy(client.E_Mail);
        return info;
      });
    }
    return fiscalInfo;
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
    console.log('updateContact', form);
    console.log('contact',contact);
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

  vm.init();


}
