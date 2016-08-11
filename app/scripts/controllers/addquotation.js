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
  vm.queryClients = queryClients;
  vm.selectedItemChange = selectedItemChange;
  vm.createQuotation = createQuotation;
  vm.isLoading = false;

  function queryClients(term){
    if(term !== '' && term){
      var deferred = $q.defer();
      var params = {term: term, autocomplete: true};
      clientService.getClients(1,params).then(function(res){
        deferred.resolve(res.data.data);
      });
      return deferred.promise;
    }
    else{
      return [];
    }
  }

  function selectedItemChange(item){
    if(item && item.id){
      vm.createQuotation(item.id);
    }
  }

  function createQuotation(clientId){
    var params = {
      Client: clientId,
      User: $rootScope.user.id
    };
    var goToSearch = true;
    vm.isLoading = true;
    quotationService.newQuotation(params, goToSearch);
  }
}
AddquotationCtrl.$inject = [
  '$location',
  '$routeParams',
  '$rootScope',
  '$q',
  'productService',
  'clientService',
  'quotationService'
];
