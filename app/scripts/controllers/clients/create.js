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
    titles: [
      {label:'Sr.', value:'Sr'},
      {label:'Sra.', value: 'Sra'},
      {label: 'Srita.', value: 'Srita'}
    ],
    genders: [
      {label:'Masculino', value: 'M'},
      {label: 'Femenino', value: 'F'}
    ],
    states: commonService.getStates(),
    countries: commonService.getCountries(),
    create: create,
    onPikadaySelect: onPikadaySelect
  });

  function onPikadaySelect(pikaday){
    console.log(pikaday);
    vm.client.birthDate = pikaday._d;
  }

  function create(){
    vm.isLoading = true;
    clientService.create(vm.client)
      .then(function(res){
        console.log(res);
        var created = res.data;
        vm.isLoading = false;
        dialogService.showDialog('Cliente registrado');
        if(created.CardCode){
          if($location.search().continueQuotation){
            $location.path('/quotation/edit/' + $rootScope.activeQuotation.id);
          }else{
            $location.path('/clients/profile/'+created.id);
          }
        }
      })
      .catch(function(err){
        console.log(err);
        vm.isLoading = false;
        dialogService.showDialog('Hubo un error');
      });
  }

}
