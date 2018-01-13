'use strict';

/**
 * @ngdoc function
 * @name actualWebApp.controller:AddquotationCtrl
 * @description
 * # AddquotationCtrl
 * Controller of the actualWebApp
 */
angular.module('actualWebApp')
  .controller('AddquotationCtrl', AddquotationCtrl);

function AddquotationCtrl(
  $rootScope, 
  $q ,
  clientService, 
  quotationService
){
  var vm = this;
  vm.queryClients = queryClients;
  vm.selectedItemChange = selectedItemChange;
  vm.createQuotation = createQuotation;
  vm.addQuotationAndClient = addQuotationAndClient;
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

  function addQuotationAndClient(){
    createQuotation(null, {createClient:true});
  }

  function createQuotation(clientId, options){
    options = options || {};
    var params = {
      User: $rootScope.user.id
    };
    
    if(clientId) {
      params.Client = clientId;
    }
    
    vm.isLoading = true;
    var createClient = false;

    if(options.createClient){
      createClient =  true;
    }

    quotationService.newQuotation(params, {
      createClient: createClient
    });
  }
}
AddquotationCtrl.$inject = [
  '$rootScope',
  '$q',
  'clientService',
  'quotationService'
];
