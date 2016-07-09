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
      if($rootScope.activeQuotation){

        if($rootScope.activeQuotation.Client == item.id){
          if($location.search().goToCheckout){
            $location.path('/checkout/client/' + $rootScope.activeQuotation.id);
          }
          else{
            $location.path('/search');
          }
        }
        else if(!$rootScope.activeQuotation.Client){
          var params = {Client: item.id};
          quotationService.update($rootScope.activeQuotation.id, params).then(function(res){
            quotationService.setActiveQuotation($rootScope.activeQuotation.id);
            if($location.search().goToCheckout){
              $location.path('/checkout/client/' + $rootScope.activeQuotation.id);
            }
            else{
              $location.path('/search');
            }
          });
        }
        else{
          vm.createQuotation(item.id)
        }
      }
      else{
        vm.createQuotation(item.id);
      }

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
