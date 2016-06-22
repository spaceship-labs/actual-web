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

function AddquotationCtrl($location,$routeParams, $q ,productService, userService, quotationService){
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
      userService.getClients(1,params).then(function(res){
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
    if(item && item.CardCode){
      console.log(item);
      vm.createQuotation(item.CardCode);
      //$location.path('/cart');
      /*
      vm.group.Products.push(item);
      vm.selectedProduct = null;
      vm.searchText = null;
      */
    }
  }

  function createQuotation(cardCode){
    console.log(cardCode);
    var params = {Client: cardCode};
    quotationService.create(params).then(function(res){
      console.log(res);
    });
  }


}
