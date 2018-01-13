'use strict';

/**
 * @ngdoc function
 * @name actualWebApp.controller:HomeCtrl
 * @description
 * # HomeCtrl
 * Controller of the actualWebApp
 */
angular.module('actualWebApp')
  .controller('HomeCtrl', HomeCtrl);

function HomeCtrl(
  $location, 
  $scope,
  $rootScope,
  api, 
  dialogService,
  siteService,
  metaTagsService
){
  var vm = this;
  var mainDataListener = function(){};
  angular.extend(vm,{
    areProductsLoaded: false,
    api: api,
    test: test
  });

  function init(){
    metaTagsService.setMetaTags({});

    siteService.findByHandle($rootScope.siteTheme, {getBanners:true})
      .then(function(res){
        console.log('res findByHandle', res);
        var site = res.data;
        site.Banners = siteService.sortSiteBanners(site);
        vm.siteBanners = site.Banners;
      });

    setCategoryStockProperty();
    if($location.search().startQuotation){
      //dialogService.showDialog('Cotizacion creada, agrega productos a tu cotización');
    }
    if($rootScope.activeStore){
      setCategoryStockProperty(null, {activeStore: $rootScope.activeStore});
    }else{
      mainDataListener = $rootScope.$on('mainDataLoaded', setCategoryStockProperty);
    }
  }

  function setCategoryStockProperty(event, mainData){
    var activeStore = mainData ?  mainData.activeStore : false;
    vm.stockProperty = 'productsNum';
    if(activeStore && activeStore.code !== 'proyectos'){
      vm.stockProperty = activeStore.code;
    }
  }

  function test(){
    siteService.test()
      .then(function(res){
        console.log('res', res);
      })
      .catch(function(err){
        console.log('err', err);
      });
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
  'dialogService',
  'siteService',
  'metaTagsService'
];
