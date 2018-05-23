'use strict';

angular.module('actualWebApp').controller('HomeCtrl', HomeCtrl);

/** @ngInject **/
function HomeCtrl(
  $location,
  $scope,
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
  var VISIBLE_PRODUCTS_LIMIT = 3;
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
    $scope.loadMore = function(type) {
      switch (type) {
        case 'livingRooms':
          vm.limitLivingRooms = vm.limitLivingRooms + VISIBLE_PRODUCTS_LIMIT;
          break;
        case 'dinningRooms':
          vm.limitDinningRooms = vm.limitDinningRooms + VISIBLE_PRODUCTS_LIMIT;
          break;
        case 'bedRooms':
          vm.limitBedRooms = vm.limitBedRooms + VISIBLE_PRODUCTS_LIMIT;
          break;
        case 'kidsBeds':
          vm.limitKidsBeds = vm.limitKidsBeds + VISIBLE_PRODUCTS_LIMIT;
          break;
        case 'kidsBureaus':
          vm.limitKidsBureaus = vm.limitKidsBureaus + VISIBLE_PRODUCTS_LIMIT;
          break;
        case 'kidsForniture':
          vm.limitKidsForniture =
            vm.limitKidsForniture + VISIBLE_PRODUCTS_LIMIT;
          break;

        default:
          console.log(type);
      }
    };
    metaTagsService.setMetaTags({});
    loadBanners();

    if ($routeParams.completeRegister) {
      dialogService.showDialog(
        'Has completado tu registro, ahora tienes todos los beneficios de tener una cuenta en Actual'
      );
    }

    var sortOption = {
      key: 'salesCount',
      direction: 'DESC'
    };

    if (activeStore.code !== 'actual_kids') {
      loadProducts('salas', sortOption, PRODUCTS_TO_LOAD).then(function(
        products
      ) {
        vm.livingRooms = products;
      });

      loadProducts('comedores', sortOption, PRODUCTS_TO_LOAD).then(function(
        products
      ) {
        vm.dinningRooms = products;
      });

      loadProducts('recamaras', sortOption, PRODUCTS_TO_LOAD).then(function(
        products
      ) {
        vm.bedRooms = products;
      });
    } else {
      loadProducts('ninos', sortOption, PRODUCTS_TO_LOAD).then(function(
        products
      ) {
        vm.kidsForniture = products;
      });

      loadProducts('comoda-infantil', sortOption, PRODUCTS_TO_LOAD).then(
        function(products) {
          vm.kidsBureaus = products;
        }
      );

      loadProducts('camas-infantiles', sortOption, PRODUCTS_TO_LOAD).then(
        function(products) {
          vm.kidsBeds = products;
        }
      );
    }
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
