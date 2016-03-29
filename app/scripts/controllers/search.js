'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:SearchCtrl
 * @description
 * # SearchCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('SearchCtrl', SearchCtrl);

function SearchCtrl($location,$routeParams ,productService){
  var vm = this;
  vm.init = init;
  vm.loadMore = loadMore;

  vm.totalResults = 0;
  vm.isLoading = false;
  vm.loadMoreCount = 1;

  vm.search = {
    term: $location.search().term,
    items: 10
  };

  vm.init();

  function init(){
    vm.isLoading = true;
    productService.search(vm.search).then(function(res){
      console.log(res);
      vm.totalResults = res.data.total;
      vm.products = productService.formatProducts(res.data.data);
      vm.isLoading = false;
    });
  }

  function loadMore(){
    vm.loadMoreCount++;
    vm.search.page = vm.loadMoreCount;
    vm.isLoading = true;
    productService.search(vm.search).then(function(res){
      console.log(res);
      vm.totalResults = res.data.total;
      var productsAux = angular.copy(vm.products);
      var newProducts = productService.formatProducts(res.data.data);
      vm.products = productsAux.concat(newProducts);
      vm.isLoading = false;
    });
  }

}
