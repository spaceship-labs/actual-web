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
  categoriesService
) {
  var vm = this;
  var activeStoreId = localStorageService.get('activeStore'); 
  var activeStoreWarehouse = false;
  var mainDataListener = function(){};

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
    resetProductCartQuantity: resetProductCartQuantity,
    trustAsHtml: trustAsHtml,
    sas: commonService.getSasHash()
  });

  if($rootScope.isMainDataLoaded){
    init($routeParams.id);
  }else{
    mainDataListener = $rootScope.$on('mainDataLoaded', function(ev, mainData){
      init($routeParams.id);
    });
  }
  
  //init($routeParams.id);

  function init(productId, reload){
    vm.filters               = [];
    vm.activeVariants        = {};
    vm.galleryImages         = [];
    vm.isLoading             = true;
    vm.isLoadingDeliveries   = true;


    productService.getById(productId)
      .then(function(res){
        return productService.formatSingleProduct(res.data.data);
      })
      .then(function(fProduct){
        vm.product = fProduct;
        vm.mainPromo = vm.product.mainPromo;
        vm.lowestCategory = categoriesService.getLowestCategory(vm.product.Categories);
        vm.productCart = {
          quantity: 1
        };
        if(reload){
          $location.path('/product/' + productId, false)
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
        return productService.delivery(productId, activeStoreId);
      })
      .then(function(deliveries){
        deliveries = $filter('orderBy')(deliveries, 'date');        
        if($rootScope.activeQuotation){
          deliveries = deliveryService.substractDeliveriesStockByQuotationDetails(
            $rootScope.activeQuotation.Details, 
            deliveries,
            vm.product.id
          );
        }
        vm.deliveries  = deliveries;
        vm.deliveriesGroups = deliveryService.groupDeliveryDates(vm.deliveries);
        vm.deliveriesGroups = $filter('orderBy')(vm.deliveriesGroups, 'date');
        vm.available = deliveryService.getAvailableByDeliveries(deliveries);
        if(vm.deliveries && vm.deliveries.length > 0){
          vm.productCart.deliveryGroup = vm.deliveriesGroups[0];
        }else{
          vm.productCart.quantity = 0;
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
      console.log('params', params);
      quotationService.addProduct(vm.product.id, params);      
    }
    else if(productCartItems.length > 1){
      var multiParams = productCartItems.map(function(cartItem){
        return cartService.buildAddProductToCartParams(vm.product.id, cartItem);
      });
      quotationService.addMultipleProducts(multiParams);
    }
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
    mainDataListener();
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
  'categoriesService'
];
/*
angular.element(document).ready(function() {
  angular.bootstrap(document, ['dashexampleApp']);
});
*/
