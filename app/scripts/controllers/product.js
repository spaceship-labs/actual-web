'use strict';
angular.module('actualWebApp').controller('ProductCtrl', ProductCtrl);

function ProductCtrl(
  productService,
  $scope,
  $log,
  $location,
  $rootScope,
  $routeParams,
  $q,
  $timeout,
  $mdDialog,
  $mdMedia,
  $sce,
  $filter,
  api,
  quotationService,
  pmPeriodService,
  localStorageService,
  deliveryService,
  cartService,
  commonService,
  categoriesService,
  dialogService,
  breadcrumbService,
  userService,
  metaTagsService,
  gtmService,
  activeStore,
  $mdExpansionPanel
) {
  var vm = this;
  var activeStoreWarehouse = false;
  var activeQuotationListener = function() {};

  angular.extend(vm, {
    customFullscreen: $mdMedia('xs') || $mdMedia('sm'),
    toggleVariants: true,
    variants: [],
    applyDiscount: applyDiscount,
    addToCart: addToCart,
    getQtyArray: getQtyArray,
    getWarehouseName: getWarehouseName,
    getPiecesString: getPiecesString,
    init: init,
    isImmediateDelivery: isImmediateDelivery,
    isLoading: true,
    siteTheme: $rootScope.siteTheme,
    resetProductCartQuantity: resetProductCartQuantity,
    trustAsHtml: trustAsHtml,
    sas: commonService.getSasHash(),
    breadcrumbItems: [],
    zipcodeForm: {},
    isActiveBreadcrumbItem: breadcrumbService.isActiveBreadcrumbItem,
    showZipcodeDialog: showZipcodeDialog,
    submitZipcodeForm: submitZipcodeForm
  });

  init($routeParams.id);

  function init(productId, reload) {
    $rootScope.scrollTo('main');
    console.log('start loading product', new Date());
    vm.filters = [];
    vm.activeVariants = {};
    vm.galleryImages = [];
    vm.isLoading = true;
    vm.isLoadingDeliveries = true;

    var params = { populateFields: ['CustomBrand'] };

    productService
      .getById(productId, params)
      .then(function(res) {
        var productFound = res.data.data;
        if (!productFound || !productFound.ItemCode || !res.data) {
          dialogService.showDialog('No se encontro el articulo');
        }

        return productService.formatSingleProduct(productFound);
      })
      .then(function(fProduct) {
        vm.product = fProduct;

        var metaTags = {
          title: $rootScope.siteConstants.publicName + ' | ' + vm.product.Name,
          description: vm.product.Description
        };
        metaTagsService.setMetaTags(metaTags);

        vm.mainPromo = vm.product.mainPromo;
        vm.lowestCategory = categoriesService.getLowestCategory(
          vm.product.Categories
        );
        vm.breadcrumbItems = breadcrumbService.buildProductBreadcrumb(
          vm.product.Categories
        );

        vm.productCart = {
          quantity: 1
        };

        if (vm.product.U_FAMILIA !== 'SI' || vm.product[activeStore.code] < 1) {
          $location.path('/');
          return;
        }

        if (reload) {
          $location
            .path('/' + productId, false)
            .search({ variantReload: 'true' });
          loadProductFilters(vm.product);
        } else {
          loadProductFilters(vm.product);
          loadWarehouses(activeStore);
          loadVariants(vm.product);
        }

        vm.isLoading = false;
        if ($rootScope.activeQuotation || $rootScope.isActiveQuotationLoaded) {
          var zipcodeDeliveryId = $rootScope.activeQuotation
            ? $rootScope.activeQuotation.ZipcodeDelivery
            : false;

          loadZipCodeDeliveryById(zipcodeDeliveryId);
          setUpDeliveries({
            productId: vm.product.ItemCode,
            activeStoreId: activeStore.id,
            zipcodeDeliveryId: zipcodeDeliveryId
          });
        } else {
          activeQuotationListener = $rootScope.$on(
            'activeQuotationAssigned',
            function(e) {
              var zipcodeDeliveryId = $rootScope.activeQuotation
                ? $rootScope.activeQuotation.ZipcodeDelivery
                : false;

              loadZipCodeDeliveryById(zipcodeDeliveryId);
              setUpDeliveries({
                productId: vm.product.ItemCode,
                activeStoreId: activeStore.id,
                zipcodeDeliveryId: zipcodeDeliveryId
              });
            }
          );
        }

        return productService.addSeenTime(vm.product.ItemCode);
      })
      .then(function(seenTime) {
        window.prerenderReady = true;
      })
      .catch(function(err) {
        $log.error(err);
      });

    pmPeriodService
      .getActive()
      .then(function(res) {
        vm.validPayments = res.data;
      })
      .catch(function(err) {
        $log.error(err);
      });
  }

  function loadZipCodeDeliveryById(id) {
    deliveryService.getZipcodeDeliveryById(id).then(function(res) {
      vm.zipcodeDelivery = res;
    });
  }

  function setUpDeliveries(options) {
    options = options || {};

    /*
    vm.productCart = {
      quantity: 1
    };*/

    productService
      .delivery(options.productId, options.zipcodeDeliveryId)
      .then(function(deliveries) {
        deliveries = $filter('orderBy')(deliveries, 'date');

        if ($rootScope.activeQuotation) {
          deliveries = deliveryService.substractDeliveriesStockByQuotationDetails(
            $rootScope.activeQuotation.Details,
            deliveries,
            vm.product.id
          );
        }

        console.log('deliveries', deliveries);
        vm.deliveries = deliveries;
        vm.deliveriesGroups = deliveryService.groupDeliveryDates(vm.deliveries);
        vm.deliveriesGroups = $filter('orderBy')(vm.deliveriesGroups, 'date');
        console.log('deliveriesGroups', vm.deliveriesGroups);
        vm.available = deliveryService.getAvailableByDeliveries(deliveries);

        if (vm.deliveries && vm.deliveries.length > 0) {
          vm.productCart.deliveryGroup = vm.deliveriesGroups[0];
          vm.productCart.quantity = 1;
        } else {
          vm.productCart.quantity = 0;
        }

        vm.isLoadingDeliveries = false;
        if (options.callback && _.isFunction(options.callback)) {
          options.callback();
        }
        activeQuotationListener();
      })
      .catch(function(err) {
        console.log('err', err);
        var PRODUCT_NOT_AVAILABLE_IN_ZONE_CODE =
          'PRODUCT_NOT_AVAILABLE_IN_ZONE';
        var error = err.data || err;
        console.log('error', error);
        var errMsg = error ? error.toString() : '';
        if (errMsg === 'Error: ' + PRODUCT_NOT_AVAILABLE_IN_ZONE_CODE) {
          errMsg =
            'El artículo elegido no está disponible en su ciudad de entrega';
        }
        dialogService.showDialog(errMsg);
        vm.isLoadingDeliveries = false;
        vm.deliveries = [];
        vm.productCart = {};
        vm.deliveriesGroups = [];
        vm.available = 0;
      });
  }

  function loadVariants(product) {
    productService
      .loadVariants(product, activeStore)
      .then(function(variants) {
        vm.variants = variants;
        vm.hasVariants = checkIfHasVariants(vm.variants);
      })
      .catch(function(err) {
        console.log(err);
      });
  }

  function checkIfHasVariants(variants) {
    var hasVariants = false;
    for (var key in variants) {
      if (variants[key].products.length > 1) {
        hasVariants = true;
      }
    }
    return hasVariants;
  }

  function getPiecesString(stock) {
    var str = 'piezas';
    if (stock === 1) {
      str = 'pieza';
    }
    return str;
  }

  function getWarehouseName(whsId) {
    var name = '';
    if (vm.warehouses) {
      name = _.findWhere(vm.warehouses, { id: whsId }).WhsName;
    }
    return name;
  }

  function loadWarehouses(_activeStore) {
    api.$http
      .get('/company/find')
      .then(function(res) {
        vm.warehouses = res.data;
        activeStoreWarehouse = _.findWhere(vm.warehouses, {
          id: _activeStore.Warehouse
        });
      })
      .catch(function(err) {
        $log.error(err);
      });
  }

  function applyDiscount(discount, price) {
    var result = price;
    result = price - (price / 100) * discount;
    return result;
  }

  function trustAsHtml(string) {
    return $sce.trustAsHtml(string);
  }

  function loadProductFilters(product) {
    productService
      .getAllFilters({ quickread: true })
      .then(function(res) {
        var data = res.data || [];
        var filters = data.map(function(filter) {
          filter.Values = [];
          product.FilterValues.forEach(function(value) {
            if (value.Filter === filter.id) {
              filter.Values.push(value);
            }
          });
          return filter;
        });
        vm.filters = filters.filter(function(filter) {
          return filter.Values.length > 0;
        });
      })
      .catch(function(err) {
        $log.error(err);
      });
  }

  function addToCart($event) {
    if (!vm.zipcodeDelivery) {
      showZipcodeDialog(null);
      return;
    }

    if (vm.isLoadingDeliveries) {
      return;
    }

    $rootScope.scrollTo('main');
    vm.isLoading = true;
    var productCartItems = cartService.getProductCartItems(
      vm.productCart.deliveryGroup,
      vm.productCart.quantity,
      vm.warehouses,
      activeStoreWarehouse
    );

    gtmService.notifyAddToCart(
      vm.product.ItemCode,
      vm.productCart.quantity,
      vm.product.Price * vm.productCart.quantity,
      vm.zipcodeDelivery.cp
    );

    if (productCartItems.length === 1) {
      var cartItem = productCartItems[0];
      var params = cartService.buildAddProductToCartParams(
        vm.product.id,
        cartItem
      );
      params.zipcodeDeliveryId = vm.zipcodeDelivery.id;
      quotationService.addProduct(vm.product.id, params);
    } else if (productCartItems.length > 1) {
      var multiParams = productCartItems.map(function(cartItem) {
        return cartService.buildAddProductToCartParams(vm.product.id, cartItem);
      });
      var options = {
        zipcodeDeliveryId: vm.zipcodeDelivery.id
      };
      quotationService.addMultipleProducts(multiParams, options);
    }
  }

  function showZipcodeDialog(ev) {
    ev = null;
    var deferred = $q.defer();
    var zipcode;
    var templateUrl = 'views/partials/zipcode-dialog.html';
    var controller = ZipcodeDialogController;
    $mdDialog
      .show({
        controller: [
          '$scope',
          '$mdDialog',
          '$rootScope',
          '$location',
          'userService',
          'params',
          controller
        ],
        controllerAs: 'ctrl',
        templateUrl: templateUrl,
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        fullscreen: false,
        locals: {
          params: {}
        }
      })
      .then(function(_zipcode) {
        zipcode = _zipcode;
        return setUpDeliveriesByZipcode(zipcode);
      })
      .catch(function(err) {
        vm.isLoadingDeliveries = false;
        console.log('err', err);
        var errMsg = '';
        if (err) {
          errMsg = err.data || err;
          errMsg = errMsg ? errMsg.toString() : '';
          dialogService.showDialog(errMsg);
        }
      });
  }

  function setUpDeliveriesByZipcode(zipcode) {
    vm.isLoadingDeliveries = true;
    return deliveryService
      .getZipcodeDelivery(zipcode)
      .then(function(zipcodeDelivery) {
        console.log('zipcodedelivery', zipcodeDelivery);
        if (zipcodeDelivery) {
          vm.isLoadingDeliveries = true;
          vm.zipcodeDelivery = zipcodeDelivery;

          return setUpDeliveries({
            productId: vm.product.ItemCode,
            activeStoreId: activeStore.id,
            zipcodeDeliveryId: zipcodeDelivery.id
          });
        } else {
          if (zipcode) {
            vm.isLoadingDeliveries = false;
            dialogService.showDialog(
              'Por el momento, su código postal esta fuera de nuestra área de cobertura'
            );
          }
          return $q.resolve();
        }
      });
  }

  function submitZipcodeForm($form, zipcode) {
    var _isValidZipcode = isValidZipcode(zipcode);

    if ($form.$valid && _isValidZipcode) {
      setUpDeliveriesByZipcode(zipcode)
        .then(function() {
          vm.cpFormToggle = false;
        })
        .catch(function(err) {
          vm.isLoadingDeliveries = false;
          console.log('err', err);
          var errMsg = '';
          if (err) {
            errMsg = err.data || err;
            errMsg = errMsg ? errMsg.toString() : '';
            dialogService.showDialog(errMsg);
          }
        });
    } else if (!_isValidZipcode) {
      vm.zipcodeForm.errMessage = 'El código postal no es valido';
    } else {
      vm.zipcodeForm.errMessage = 'Ingresa tus datos';
    }
  }

  function isValidZipcode(zipcode) {
    return zipcode.length === 5 || zipcode === '_29030';
  }

  function resetProductCartQuantity() {
    vm.productCart = cartService.resetProductCartQuantity(vm.productCart);
  }

  function getQtyArray(n) {
    n = n || 0;
    var arr = [];
    for (var i = 0; i < n; i++) {
      arr.push(i + 1);
    }
    return arr;
  }

  function isImmediateDelivery(date) {
    var currentDate = moment().startOf('date');
    date = moment(date).startOf('date');
    return currentDate.format() === date.format();
  }

  $scope.$on('$destroy', function() {
    //unsuscribing listeners
    $mdDialog.hide();
    console.log('closing dialog');
    activeQuotationListener();
    $mdDialog.cancel();
  });
}

ProductCtrl.$inject = [
  'productService',
  '$scope',
  '$log',
  '$location',
  '$rootScope',
  '$routeParams',
  '$q',
  '$timeout',
  '$mdDialog',
  '$mdMedia',
  '$sce',
  '$filter',
  'api',
  'quotationService',
  'pmPeriodService',
  'localStorageService',
  'deliveryService',
  'cartService',
  'commonService',
  'categoriesService',
  'dialogService',
  'breadcrumbService',
  'userService',
  'metaTagsService',
  'gtmService',
  'activeStore'
];
