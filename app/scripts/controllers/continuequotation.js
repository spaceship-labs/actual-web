'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:ContinuequotationCtrl
 * @description
 * # ContinuequotationCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('ContinuequotationCtrl', ContinuequotationCtrl);

function ContinuequotationCtrl($location,$routeParams, $rootScope, $q ,productService, clientService, quotationService){
  var vm = this;
  vm.queryClients = queryClients;
  vm.selectedItemChange = selectedItemChange;
  vm.activeQuotationId = quotationService.getActiveQuotationId();

  function init(){
  }

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
      vm.isLoading = true;
      if($rootScope.activeQuotation){

        if($rootScope.activeQuotation.Client === item.id){
          if($location.search().goToCheckout){
            $location.path('/');
          }
          else{
            $location.path('/checkout/client/' + $rootScope.activeQuotation.id);
          }
        }

        else if(!$rootScope.activeQuotation.Client){
          continueQuotationByClient(item);
        }
      }
    }
  }

  function continueQuotationByClient(client){
    var params = {Client: client.id};
    quotationService.update($rootScope.activeQuotation.id, params).then(function(res){
      quotationService.setActiveQuotation($rootScope.activeQuotation.id);
      if($location.search().goToCheckout){
        $location.path('/checkout/client/' + $rootScope.activeQuotation.id);
      }
      else{
        $location.path('/').search({startQuotation:true});
      }
    });
  }

  init();
}

ContinuequotationCtrl.$inject = [
  '$location',
  '$routeParams',
  '$rootScope',
  '$q',
  'productService',
  'clientService',
  'quotationService'
];
