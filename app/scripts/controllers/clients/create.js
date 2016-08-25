'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:ClientCreateCtrl
 * @description
 * # ClientCreateCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('ClientCreateCtrl', ClientCreateCtrl);

function ClientCreateCtrl($location, $rootScope, dialogService, commonService, clientService){
  var vm = this;

  angular.extend(vm, {
    activeTab: 0,
    client:{},
    contacts:[{}],
    titles: [
      {label:'Sr.', value:'Sr'},
      {label:'Sra.', value: 'Sra'},
      {label: 'Srita.', value: 'Srita'}
    ],
    genders: [
      {label:'Masculino', value: 'M'},
      {label: 'Femenino', value: 'F'}
    ],
    states: [],
    countries: commonService.getCountries(),
    create: create,
    onPikadaySelect: onPikadaySelect
  });

  function onPikadaySelect(pikaday){
    console.log(pikaday);
    vm.client.birthDate = pikaday._d;
  }

  function addContact(form){
    if(form.$valid){
      vm.contacts.push({});
    }else{
      dialogService.showDialog('Campos incompletos');
    }
  }

  function init(){
    commonService.getStatesSap().then(function(res){
      vm.states = res.data;
    })
    .catch(function(err){
      console.log(err);
    })
  }

  function create(){
    vm.isLoading = true;
    vm.client.contacts = vm.contacts.filter(function(c){
      return true;
    });
    console.log('client: ', vm.client);
    clientService.create(vm.client)
      .then(function(res){
        console.log(res);
        var created = res.data;
        vm.isLoading = false;
        dialogService.showDialog('Cliente registrado');
        if(created.CardCode){
          if($location.search().continueQuotation){
            $location
              .path('/quotation/edit/' + $rootScope.activeQuotation.id)
              .search({createdClient:true});
          }else{
            $location
              .path('/clients/profile/'+created.id)
              .search({createdClient:true});
          }
        }
      })
      .catch(function(err){
        console.log(err);
        vm.isLoading = false;
        dialogService.showDialog('Hubo un error');
      });
  }

  init();

}
