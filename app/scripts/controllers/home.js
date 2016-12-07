'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:HomeCtrl
 * @description
 * # HomeCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('HomeCtrl', HomeCtrl);

function HomeCtrl(
  $location, 
  $rootScope,
  api, 
  dialogService,
  productService
){
  var vm = this;
  angular.extend(vm,{
    areProductsLoaded: false,
    api: api,
  });

  function init(){
    setCategoryStockProperty();
    if($location.search().startQuotation){
      dialogService.showDialog('Cotizacion creada, agrega productos a tu cotización')
    }

      vm.search = {
        items: 10,
        page: 1,
        populateImgs : true
      };
      vm.isLoading = true;
      productService.searchByFilters(vm.search).then(function(res){
        vm.totalResults = res.data.total;
        vm.isLoading = false;
        return productService.formatProducts(res.data.products);
      })
      .then(function(fProducts){
        vm.products = fProducts;
        vm.areProductsLoaded = true;
      })
  }

  $rootScope.$on('activeStoreAssigned', setCategoryStockProperty);

  function setCategoryStockProperty(event, activeStore){
    vm.stockProperty = 'productsNum';
    if(activeStore && activeStore.code != 'proyectos'){
      vm.stockProperty = activeStore.code;
    }
  }

  init();
}

HomeCtrl.$inject = [
  '$location',
  '$rootScope',
  'api',
  'dialogService',
  'productService'
];
