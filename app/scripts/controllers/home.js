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

function HomeCtrl($timeout, $location, productService, api, dialogService){
  var vm = this;
  angular.extend(vm,{
    areProductsLoaded: false,
    api: api,
    init: init,
  });

  function init(){
    if($location.search().startQuotation){
      dialogService.showDialog('Cotizacion creada, agrega productos a tu cotización')
    }
  }

  vm.init();
}

HomeCtrl.$inject = ['$timeout','$location','productService','api','dialogService'];
