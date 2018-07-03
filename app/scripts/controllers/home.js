'use strict';

angular.module('actualWebApp').controller('HomeCtrl', HomeCtrl);

/** @ngInject **/
function HomeCtrl(
  $location,
  $scope,
  $timeout,
  $rootScope,
  $routeParams,
  api,
  siteService,
  productService,
  metaTagsService,
  dialogService,
  activeStore
) {
  var vm = this;
  var VISIBLE_PRODUCTS_LIMIT = 6;
  var PRODUCTS_TO_LOAD = 6;
  angular.extend(vm, {
    areProductsLoaded: false,
    api: api,
    categoriesCarouselBreakpoints: [
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true
        }
      }
    ],
    bestSellersCarouselBreakpoints: [
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true
        }
      }
    ],
    secondSliderCarouselBreakpoints: [
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true
        }
      }
    ]
  });

  function init() {
    vm.activeStore = activeStore;
    vm.stockProperty = 'productsNum';
    vm.limitLivingRooms = VISIBLE_PRODUCTS_LIMIT;
    vm.limitDinningRooms = VISIBLE_PRODUCTS_LIMIT;
    vm.limitBedRooms = VISIBLE_PRODUCTS_LIMIT;
    vm.limitKidsBeds = VISIBLE_PRODUCTS_LIMIT;
    vm.limitKidsBureaus = VISIBLE_PRODUCTS_LIMIT;
    vm.limitKidsForniture = VISIBLE_PRODUCTS_LIMIT;

    if (activeStore) {
      vm.stockProperty = activeStore.code;
    }
    metaTagsService.setMetaTags({});
    loadBannersAndFeaturedProducts();

    if ($routeParams.completeRegister) {
      dialogService.showDialog(
        'Has completado tu registro, ahora tienes todos los beneficios de tener una cuenta en Actual'
      );
    }

    var sortOption = {
      key: 'salesCount',
      direction: 'DESC'
    };

    vm.top = {};
  }

  function loadBannersAndFeaturedProducts() {
    siteService
      .findByHandle($rootScope.siteTheme, { getBanners: true })
      .then(function(res) {
        console.log('res findByHandle', res);
        var site = res.data;
        site.Banners = siteService.sortSiteBanners(site);
        vm.siteBanners = site.Banners;
        return productService.getFeaturedProducts(site.id);
      })
      .then(function(result) {
        vm.featuredProducts = result.data;
        vm.featuredProducts.map(function(featured) {
          featured.product = productService.formatProductSync(featured.product);
          return featured;
        });
        $timeout(function() {
          vm.featuredLoaded = true;
        }, 600);
      });
  }
  init();
}

HomeCtrl.$inject = [
  '$location',
  '$scope',
  '$timeout',
  '$rootScope',
  '$routeParams',
  'api',
  'siteService',
  'productService',
  'metaTagsService',
  'dialogService',
  'activeStore'
];
