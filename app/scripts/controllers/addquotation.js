'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:AddquotationCtrl
 * @description
 * # AddquotationCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('AddquotationCtrl', AddquotationCtrl);

function AddquotationCtrl($location,$routeParams, $rootScope, $q ,productService, clientService, quotationService){
  var vm = this;
  console.log(vm);
  vm.queryClients = queryClients;
  vm.selectedItemChange = selectedItemChange;
  vm.createQuotation = createQuotation;

  function queryClients(term){
    console.log(term);
    console.log('queryClients');
    if(term !== '' && term){
      var deferred = $q.defer();
      var params = {term: term, autocomplete: true};
      clientService.getClients(1,params).then(function(res){
        console.log(res);
        deferred.resolve(res.data.data);
      });
      return deferred.promise;
    }
    else{
      return [];
    }
  }

  function selectedItemChange(item){
    console.log(item);
    if(item && item.id){
      console.log(item);
      vm.createQuotation(item.id);
    }
  }

  function createQuotation(clientId){
    var params = {
      Client: clientId,
      User: $rootScope.user.id
    };
    var goToSearch = true;
    quotationService.newQuotation(params, goToSearch);
  }


}
