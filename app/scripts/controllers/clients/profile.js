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
    $q,
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
    updateFiscalAddress: updateFiscalAddress,
    createQuotation: createQuotation,
    changeTab: changeTab,
    contactAction: contactAction,
    onPikadaySelect: onPikadaySelect,
    updatePersonalData: updatePersonalData,
    apiResourceLeads: quotationService.getByClient,
    apiResourceOrders: orderService.getList,
    updateContact: updateContact,
    createContact: createContact,
    openMapDialog: openMapDialog,
    isContactEditModeActive: isContactEditModeActive,
    showNewFiscalForm: showNewFiscalForm,
    showNewAddressForm: showNewAddressForm
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

      vm.client = setClientDefaultData(vm.client);

      commonService.getStatesSap().then(function(res){
        console.log(res);
        vm.states = res.data;
      }).catch(function(err){
        console.log(err);
      });

    });
  }

  function setClientDefaultData(client){
    if(!client.FiscalAddress){
      client.FiscalAddress = {};
    }
    if(!client.FiscalAddress.U_Correos){
      client.FiscalAddress.U_Correos = angular.copy(client.E_Mail);
    }

    client.Contacts = client.Contacts.map(function(contact){
      if(!contact.E_Mail){
        contact.E_Mail = angular.copy(client.E_Mail);
      }
      if(!contact.FirstName){
        contact.FirstName = angular.copy(client.CardName);
      }
      if(!contact.Tel1){
        contact.Tel1 = angular.copy(client.Phone1);
      }
      if(!contact.Cellolar){
        contact.Cellolar = angular.copy(client.Cellular);
      }
      contact.editEnabled = false;

      return contact;
    });    
    return client;
  }

  function showNewFiscalForm(){
    vm.isNewFiscalFormActive = true;
    vm.newFiscalAddress = {
      U_Correos:angular.copy(vm.client.E_Mail)
    };
  }

  function showNewAddressForm(){
    vm.isNewAddressFormActive = true;
    vm.newContact = {
      E_Mail:angular.copy(vm.client.E_Mail)
    };
  }


  function formatClient(client){
    client.Birthdate = client.Birthdate  ? client.Birthdate : new Date();
    client.FirstName = client.FirstName || angular.copy(client.CardName);
    vm.filtersQuotations = {Client: client.id};
    vm.filtersOrders = {Client: client.id};
    return client;
  }  

  function changeTab(index){
    vm.activeTab = index;
    $location.search({activeTab: index});
  }

  function onPikadaySelect(pikaday){
    vm.client.Birthdate = pikaday._d;
  }

  function updatePersonalData(form){
    var isValidEmail = commonService.isValidEmail(
      vm.client.E_Mail,
      {excludeActualDomains: true}
    );
    if(form.$valid && isValidEmail ){
      vm.isLoading = true;
      var params = angular.copy(vm.client);
      delete params.FiscalAddress;
      delete params.Contacts;
      console.log('params', params);
      clientService.update(vm.client.CardCode, params).then(function (res){
        console.log(res);
        vm.isLoading = false;
        dialogService.showDialog('Datos personales actualizados',returnToCheckout);
      }).catch(function(err){
        console.log(err);
        dialogService.showDialog('Hubo un error, revisa los campos');
        vm.isLoading = false;
      });
    }else if(!isValidEmail){
      vm.isLoading = false;
      dialogService.showDialog('Email no valido');
    }else{
      vm.isLoading = false;
      dialogService.showDialog('Campos incompletos');
    }
  }


  function createQuotation(){
    var params = {
      User: $rootScope.user.id,
      Client: vm.client.id,
    };
    var goToSearch = false;
    vm.isLoading = true;
    quotationService.newQuotation(params, goToSearch);
  }

  function contactAction(form, contact){
    if(contact.editEnabled){
      updateContact(form, contact);
    }else{
      contact.editEnabled = true;
    }
  }

  function updateContact(form, contact){
    var isValidEmail = commonService.isValidEmail(
      contact.E_Mail,
      {excludeActualDomains: true}
    );
    if( form.$valid && isValidEmail ){
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
        dialogService.showDialog('Dirección de entrega actualizada', returnToCheckout);
      })
      .catch(function(err){
        console.log(err);
        dialogService.showDialog('Hubo un error');
        contact.isLoading = false;
      });
    }else if(!isValidEmail){
      vm.isLoading = false;
      dialogService.showDialog('Email no valido');
    }else{
      vm.isLoading = false;
      dialogService.showDialog('Campos incompletos');
    }
  }

  function createContact(form){
    vm.isLoading = true;
    var isValidEmail = commonService.isValidEmail(
      vm.newContact.E_Mail,
      {excludeActualDomains: true}
    );
    if(form.$valid && isValidEmail){
      console.log(vm.newContact);
      clientService.createContact(vm.client.CardCode,vm.newContact)
        .then(function(res){
          console.log(res);
          vm.isLoading = false;
          vm.showNewContact = false;
          vm.newContact = {};
          dialogService.showDialog('Dirección creada', returnToCheckout);
          var created = res.data;
          vm.client.Contacts.push(created);
          
        })
        .catch(function(err){
          vm.isLoading = false;
          console.log(err);
          dialogService.showDialog('Hubo un error');
        });
    }else if(!isValidEmail){
      vm.isLoading = false;
      dialogService.showDialog('Email no valido');
    }else{
      vm.isLoading = false;
      dialogService.showDialog('Campos incompletos');
    }
  }

  function isContactEditModeActive(){
    if(vm.client && vm.client.Contacts){
      if(_.findWhere(vm.client.Contacts, {editEnabled:true})){
        return true;
      }
    }
    return false;
  }


  function updateFiscalAddress(form){
    vm.isLoading = true;
    var isValidEmail = commonService.isValidEmail(
      vm.client.FiscalAddress.U_Correos,
      {excludeActualDomains: true}
    );
    if(form.$valid && isValidEmail){
      var promise;
      var creating = false;
      var params = angular.copy(vm.client.FiscalAddress);
      params.LicTradNum = angular.copy(vm.client.LicTradNum);

      clientService.updateFiscalAddress(
        params.id, 
        vm.client.CardCode,
        params
      )
      .then(function(results){
        vm.isLoading = false;        
        dialogService.showDialog('Datos guardados');
      })
      .catch(function(err){
        vm.isLoading = false;
        console.log(err);
        dialogService.showDialog('Hubo un error al guardar datos de facturación');
      });
    }else if(!isValidEmail){
      vm.isLoading = false;
      dialogService.showDialog('Email no valido');
    }else{
      vm.isLoading = false;
      dialogService.showDialog('Campos incompletos');
    }

  }

  function returnToCheckout(){
    if($location.search() && $location.search().checkoutProcess){
      var quotationId = $location.search().checkoutProcess;
      $location.path('/checkout/client/' + quotationId);
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
