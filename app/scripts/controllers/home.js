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

    var sortOption = {
      key: 'salesCount',
      direction: 'DESC'
    };

    loadProducts('salas', sortOption, 8).then(function(products) {
      vm.livingRooms = products;
    });

    loadProducts('comedores', sortOption, 8).then(function(products) {
      vm.dinningRooms = products;
    });

    loadProducts('recamaras', sortOption, 8).then(function(products) {
      vm.bedRooms = products;
    });
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

  function loadProducts(category, sortOption, limit) {
    return productService
      .searchCategoryByFilters({
        category: category,
        sortOption: sortOption,
        limit: limit
      })
      .then(function(res) {
        var products = res.data.products || [];
        return productService.formatProducts(products);
      })
      .then(function(productsFormatted) {
        return productsFormatted;
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
