'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:ProductCtrl
 * @description
 * # ProductCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('ProductCtrl', ProductCtrl);

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
  clientService
) {
  var vm = this;
  var activeStoreId = localStorageService.get('activeStore');
  var activeStoreWarehouse = false;
  var mainDataListener = function(){};
  var categoriesTreeListener = function(){};
  var activeQuotationListener = function(){};

  angular.extend(vm, {
    customFullscreen: ($mdMedia('xs') || $mdMedia('sm') ),
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
    isActiveBreadcrumbItem: breadcrumbService.isActiveBreadcrumbItem
  });


  if($rootScope.activeStore){
    init($routeParams.id);
  }else{
    mainDataListener = $rootScope.$on('activeStoreAssigned', function(e){
      init($routeParams.id);
    });
  }

  //init($routeParams.id);

  function init(productId, reload){
    console.log('start loading product', new Date());
    vm.filters               = [];
    vm.activeVariants        = {};
    vm.galleryImages         = [];
    vm.isLoading             = true;
    vm.isLoadingDeliveries   = true;

    productService.getById(productId)
      .then(function(res){
        var productFound = res.data.data;
        if(!productFound || !productFound.ItemCode){
          dialogService.showDialog('No se encontro el articulo');
        }

        return productService.formatSingleProduct(productFound);
      })
      .then(function(fProduct){
        vm.product = fProduct;
        vm.mainPromo = vm.product.mainPromo;
        vm.lowestCategory = categoriesService.getLowestCategory(vm.product.Categories);
        vm.breadcrumbItems = breadcrumbService.buildProductBreadcrumb(vm.product.Categories);

        vm.productCart = {
          quantity: 1
        };

        if(reload){
          $location.path('/' + productId, false)
            .search({variantReload:'true'});
          loadProductFilters(vm.product);
        }else{
          loadProductFilters(vm.product);
          if($rootScope.activeStore){
            loadWarehouses($rootScope.activeStore);
            loadVariants(vm.product);
          }
        }

        vm.isLoading = false;
        if($rootScope.activeQuotation || $rootScope.isActiveQuotationLoaded){
          var zipcodeDeliveryId =  $rootScope.activeQuotation ? $rootScope.activeQuotation.ZipcodeDelivery : false;

          loadZipCodeDeliveryById(zipcodeDeliveryId);
          setUpDeliveries({
            productId: vm.product.ItemCode,
            activeStoreId: activeStoreId,
            zipcodeDeliveryId: zipcodeDeliveryId
          });

        }else{
          activeQuotationListener = $rootScope.$on('activeQuotationAssigned', function(e){
            var zipcodeDeliveryId =  $rootScope.activeQuotation ? $rootScope.activeQuotation.ZipcodeDelivery : false;

            loadZipCodeDeliveryById(zipcodeDeliveryId);
            setUpDeliveries({
              productId: vm.product.ItemCode,
              activeStoreId: activeStoreId,
              zipcodeDeliveryId: zipcodeDeliveryId
            });

          });
        }

        return productService.addSeenTime(vm.product.ItemCode);
      })
      .then(function(seenTime){
        //console.log(seenTime);
      })
      .catch(function(err){
        $log.error(err);
      });

    pmPeriodService.getActive()
      .then(function(res){
        vm.validPayments = res.data;
      })
      .catch(function(err){
        $log.error(err);
      });

    //Unsuscribing  mainDataListener
    mainDataListener();
  }

  function loadZipCodeDeliveryById(id){
    deliveryService.getZipcodeDeliveryById(id)
      .then(function(res){
        vm.zipcodeDelivery = res;
      });
  }

  function setUpDeliveries(options){
    options = options || {};

    productService.delivery(options.productId, options.activeStoreId, options.zipcodeDeliveryId)
      .then(function(deliveries){
        deliveries = $filter('orderBy')(deliveries, 'date');

        if($rootScope.activeQuotation){
          deliveries = deliveryService.substractDeliveriesStockByQuotationDetails(
            $rootScope.activeQuotation.Details,
            deliveries,
            vm.product.id
          );
        }

        console.log('deliveries', deliveries);
        vm.deliveries  = deliveries;
        vm.deliveriesGroups = deliveryService.groupDeliveryDates(vm.deliveries);
        vm.deliveriesGroups = $filter('orderBy')(vm.deliveriesGroups, 'date');
        console.log('deliveriesGroups', vm.deliveriesGroups);
        vm.available = deliveryService.getAvailableByDeliveries(deliveries);

        if(vm.deliveries && vm.deliveries.length > 0){
          vm.productCart.deliveryGroup = vm.deliveriesGroups[0];
        }else{
          vm.productCart.quantity = 0;
        }

        vm.isLoadingDeliveries = false;
        if(options.callback && _.isFunction(options.callback) ){
          options.callback();
        }
        activeQuotationListener();
      })
      .catch(function(err){
        console.log('err', err);
      })
  }

  function loadVariants(product){
    productService.loadVariants(product, $rootScope.activeStore)
      .then(function(variants){
        vm.variants = variants;
        vm.hasVariants = checkIfHasVariants(vm.variants);
      })
      .catch(function(err){
        console.log(err);
      });
  }

  function checkIfHasVariants(variants){
    var hasVariants = false;
    for(var key in variants){
      if(variants[key].products.length > 1){
        hasVariants = true;
      }
    }
    return hasVariants;
  }

  function getPiecesString(stock){
    var str = 'piezas';
    if(stock === 1){
      str = 'pieza';
    }
    return str;
  }

  function getWarehouseName(whsId){
    var name = '';
    if(vm.warehouses){
      name = _.findWhere(vm.warehouses, {id:whsId}).WhsName;
    }
    return name;
  }

  function loadWarehouses(activeStore){
    api.$http.get('/company/find')
      .then(function(res) {
        vm.warehouses = res.data;
        activeStoreWarehouse = _.findWhere(vm.warehouses,{
          id: activeStore.Warehouse
        });
      })
      .catch(function(err){
        $log.error(err);
      });
  }

  function applyDiscount(discount, price){
    var result = price;
    result = price - ( ( price / 100) * discount );
    return result;
  }

  function trustAsHtml(string) {
    return $sce.trustAsHtml(string);
  }


  function loadProductFilters(product){
    productService.getAllFilters({quickread:true})
      .then(function(res){
        var data = res.data || [];
        var filters = data.map(function(filter){
          filter.Values = [];
          product.FilterValues.forEach(function(value){
            if(value.Filter === filter.id){
              filter.Values.push(value);
            }
          });
          return filter;
        });
        vm.filters = filters.filter(function(filter){
          return filter.Values.length > 0;
        });
      })
      .catch(function(err){
        $log.error(err);
      });
  }


  function addToCart($event){
    if(!vm.zipcodeDelivery){
      showZipcodeDialog(null);
      return;
  }

    if(vm.isLoadingDeliveries){
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

    if(productCartItems.length === 1){
      var cartItem = productCartItems[0];
      var params = cartService.buildAddProductToCartParams(vm.product.id, cartItem);
      params.zipcodeDeliveryId = vm.zipcodeDelivery.id;
      quotationService.addProduct(vm.product.id, params);
    }
    else if(productCartItems.length > 1){
      var multiParams = productCartItems.map(function(cartItem){
        return cartService.buildAddProductToCartParams(vm.product.id, cartItem);
      });
      var options = {
        zipcodeDeliveryId: vm.zipcodeDelivery.id
      }
      quotationService.addMultipleProducts(multiParams, options);
    }
  }

  function showZipcodeDialog(ev) {
    var deferred = $q.defer();
    var zipcode;
    var templateUrl = 'views/partials/zipcode-dialog.html';
    console.log('zipcodedialogcontroller',ZipcodeDialogController);
    var controller  = ZipcodeDialogController;
    $mdDialog.show({
      controller: [
        '$scope',
        '$mdDialog',
        '$rootScope',
        '$location',
        'clientService',
        controller
      ],
      controllerAs: 'ctrl',
      templateUrl: templateUrl,
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      fullscreen: false,
    })
    .then(function(_zipcode) {
      zipcode = _zipcode;
      vm.isLoadingDeliveries = true;
      return deliveryService.getZipcodeDelivery(zipcode)
    })
    .then(function(zipcodeDelivery){
      console.log('zipcodedelivery', zipcodeDelivery);
      if(zipcodeDelivery){
        vm.isLoadingDeliveries = true;
        vm.zipcodeDelivery = zipcodeDelivery;
        var callback = function(){
          dialogService.showDialog('Fechas de entrega actualizadas');
        }

        return setUpDeliveries({
          productId: vm.product.ItemCode,
          activeStoreId: activeStoreId,
          zipcodeDeliveryId: zipcodeDelivery.id,
          callback: callback
        });

      }else{
        if(zipcode){
          vm.isLoadingDeliveries = false;
          dialogService.showDialog('Código postal no valido');
        }
        //return deferred.reject();
      }
    })
    .catch(function(err){
      console.log('err', err);
    })
  }

  function resetProductCartQuantity(){
    vm.productCart = cartService.resetProductCartQuantity(vm.productCart);
  }

  function getQtyArray(n){
    n = n || 0;
    var arr = [];
    for(var i=0;i<n;i++){
      arr.push(i+1);
    }
    return arr;
  }

  function isImmediateDelivery(date){
    var currentDate = moment().startOf('date');
    date = moment(date).startOf('date');
    return (currentDate.format() === date.format());
  }


  $scope.$on('$destroy', function(){
    //unsuscribing listeners
    mainDataListener();
    activeQuotationListener();
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
  'clientService'
];
/*
angular.element(document).ready(function() {
  angular.bootstrap(document, ['dashexampleApp']);
});
*/
