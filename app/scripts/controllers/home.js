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
  $scope,
  $rootScope,
  api, 
  dialogService
){
  var vm = this;
  var mainDataListener = function(){};
  angular.extend(vm,{
    areProductsLoaded: false,
    api: api,
  });

  function init(){
    setCategoryStockProperty();
    if($location.search().startQuotation){
      //dialogService.showDialog('Cotizacion creada, agrega productos a tu cotización');
    }
    mainDataListener = $rootScope.$on('mainDataLoaded', setCategoryStockProperty);
  }

  function setCategoryStockProperty(event, mainData){
    var activeStore = mainData ?  mainData.activeStore : false;
    vm.stockProperty = 'productsNum';
    if(activeStore && activeStore.code !== 'proyectos'){
      vm.stockProperty = activeStore.code;
    }
  }

  init();

  $scope.$on('$destroy', function(){
    mainDataListener();
  });
}

HomeCtrl.$inject = [
  '$location',
  '$scope',
  '$rootScope',
  'api',
  'dialogService'
];
