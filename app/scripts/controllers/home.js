'use strict';

angular.module('actualWebApp')
  .controller('HomeCtrl', HomeCtrl);

function HomeCtrl(
  $location, 
  $scope,
  $rootScope,
  $routeParams,
  api, 
  siteService,
  metaTagsService,
  dialogService,
  activeStore
){
  var vm = this;
  angular.extend(vm,{
    areProductsLoaded: false,
    api: api
  });

  function init(){
    vm.activeStore = activeStore;
    vm.stockProperty = 'productsNum';
    if(activeStore){
      vm.stockProperty = activeStore.code;
    }

    metaTagsService.setMetaTags({});
    loadBanners();

    if($routeParams.completeRegister){
      dialogService.showDialog('Has completado tu registro, ahora tienes todos los beneficios de tener una cuenta en Actual');               
    }
  }

  function loadBanners(){
    siteService.findByHandle($rootScope.siteTheme, {getBanners:true})
      .then(function(res){
        console.log('res findByHandle', res);
        var site = res.data;
        site.Banners = siteService.sortSiteBanners(site);
        vm.siteBanners = site.Banners;
      });
  }

  init();
}

HomeCtrl.$inject = [
  '$location',
  '$scope',
  '$rootScope',
  '$routeParams',
  'api',
  'siteService',
  'metaTagsService',
  'dialogService',
  'activeStore'
];
