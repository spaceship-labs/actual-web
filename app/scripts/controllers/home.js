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
  $timeout, 
  $location, 
  $rootScope,
  productService, 
  api, 
  dialogService
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
  }

  $rootScope.$on('activeStoreAssigned', setCategoryStockProperty);

  function setCategoryStockProperty(event, activeStore){
    vm.stockProperty = 'productsNum';
    if(activeStore){
      vm.stockProperty = activeStore.code;
    }
  }

  init();
}

HomeCtrl.$inject = [
  '$timeout',
  '$location',
  '$rootScope',
  'productService',
  'api',
  'dialogService'
];
