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

function AddquotationCtrl($location,$routeParams, $q ,productService){
  var vm = this;
  console.log(vm);
  vm.queryClients = queryClients;
  vm.selectedItemChange = selectedItemChange;

  function queryClients(term){
    console.log(term);
    console.log('queryClients');
    if(term != '' && term){
      var deferred = $q.defer();
      var params = {term: term, autocomplete: true};
      productService.search(params).then(function(res){
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
    if(item && item.ItemCode){
      vm.group.Products.push(item);
      vm.selectedProduct = null;
      vm.searchText = null;
    }
  }


}
