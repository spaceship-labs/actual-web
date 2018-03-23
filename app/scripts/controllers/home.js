'use strict';

angular.module('actualWebApp').controller('HomeCtrl', HomeCtrl);

function HomeCtrl(
  $location,
  $scope,
  $rootScope,
  api,
  siteService,
  productService,
  metaTagsService,
  activeStore
) {
  var vm = this;
  angular.extend(vm, {
    areProductsLoaded: false,
    api: api
  });

  function init() {
    vm.activeStore = activeStore;
    vm.stockProperty = 'productsNum';
    if (activeStore) {
      vm.stockProperty = activeStore.code;
    }

    metaTagsService.setMetaTags({});
    loadBanners();
    loadBestlivingRooms(
      'salas',
      {
        key: 'salesCount',
        direction: 'DESC'
      },
      8
    );
    loadBestDinningRooms(
      'comedores',
      {
        key: 'salesCount',
        direction: 'DESC'
      },
      8
    );
    loadBestBedRooms(
      'recamaras',
      {
        key: 'salesCount',
        direction: 'DESC'
      },
      8
    );
  }

  function loadBanners() {
    siteService
      .findByHandle($rootScope.siteTheme, { getBanners: true })
      .then(function(res) {
        console.log('res findByHandle', res);
        var site = res.data;
        site.Banners = siteService.sortSiteBanners(site);
        vm.siteBanners = site.Banners;
      });
  }

  function loadBestlivingRooms(category, sortOption, limit) {
    productService
      .searchCategoryByFilters({
        category,
        sortOption,
        limit
      })
      .then(function(res) {
        var products = res.data.products || [];
        return productService.formatProducts(products);
      })
      .then(function(productsFormatted) {
        vm.livingRooms = productsFormatted;
      });
  }

  function loadBestDinningRooms(category, sortOption, limit) {
    productService
      .searchCategoryByFilters({
        category,
        sortOption,
        limit
      })
      .then(function(res) {
        var products = res.data.products || [];
        return productService.formatProducts(products);
      })
      .then(function(productsFormatted) {
        vm.dinningRooms = productsFormatted;
      });
  }

  function loadBestBedRooms(category, sortOption, limit) {
    productService
      .searchCategoryByFilters({
        category,
        sortOption,
        limit
      })
      .then(function(res) {
        var products = res.data.products || [];
        return productService.formatProducts(products);
      })
      .then(function(productsFormatted) {
        vm.bedRooms = productsFormatted;
      });
  }

  init();
}

HomeCtrl.$inject = [
  '$location',
  '$scope',
  '$rootScope',
  'api',
  'siteService',
  'productService',
  'metaTagsService',
  'activeStore'
];
