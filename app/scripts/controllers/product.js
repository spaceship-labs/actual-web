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
  deliveryService
) {
  var vm = this;
  var activeStoreId = localStorageService.get('activeStore'); 
  var activeStore = $rootScope.activeStore;
  var activeStoreWarehouse = false;


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
    resetCartQuantity: resetCartQuantity,
    showMessageCart: showMessageCart,
    trustAsHtml: trustAsHtml,
    sas:{
      '001': 'Studio',
      '002': 'Home',
      '003': 'Ambas',
      '004': 'Kids'
    }  
  });

  vm.init($routeParams.id);

  function init(productId, reload){
    vm.filters               = [];
    vm.activeVariants        = {};
    vm.galleryImages         = [];
    vm.isLoading             = true;

    productService.getById(productId)
      .then(function(res){
        return productService.formatSingleProduct(res.data.data);
      })
      .then(function(fProduct){
        var promises = [];
        vm.product = fProduct;
        vm.mainPromo = vm.product.mainPromo;
        vm.lowestCategory = getLowestCategory();
        vm.productCart = {
          quantity: 1
        };
        if(reload){
          $location.path('/product/' + productId, false);
          loadProductFilters(vm.product);
        }else{
          loadProductFilters(vm.product);
          if($rootScope.activeStore){
            getWarehouses($rootScope.activeStore);
            productService.loadVariants(vm.product, $rootScope.activeStore)
              .then(function(variants){
                vm.variants = variants;
                vm.hasVariants = checkIfHasVariants(vm.variants);
              });
          }else{
            $rootScope.$on('activeStoreAssigned',function(e,data){
              activeStore = data;
              getWarehouses(activeStore);
              productService.loadVariants(vm.product)
                .then(function(variants, activeStore){
                  vm.variants = variants;
                  vm.hasVariants = checkIfHasVariants(vm.variants);
                });
            });
          }
        }
        vm.isLoading = false;
        return productService.delivery(productId, activeStoreId);
      })
      .then(function(deliveries){
        deliveries = $filter('orderBy')(deliveries, 'date');        
        vm.available = deliveryService.getAvailableByDeliveries(deliveries);
        if($rootScope.activeQuotation){
          deliveries = deliveryService.substractDeliveriesStockByDetails(
            $rootScope.activeQuotation.Details, 
            deliveries,
            vm.product.id
          );
        }
        vm.deliveries  = deliveries;
        vm.deliveriesGroups = deliveryService.groupDeliveryDates(vm.deliveries);
        vm.deliveriesGroups = $filter('orderBy')(vm.deliveriesGroups, 'date');
        if(vm.deliveries && vm.deliveries.length > 0){
          vm.productCart.deliveryGroup = vm.deliveriesGroups[0];
        }else{
          vm.productCart.quantity = 0;
        }
        return productService.addSeenTime(vm.product.ItemCode);
      })
      .then(function(seenTime){
        console.log(seenTime);
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
  }

  function checkIfHasVariants(variants){
    var hasVariants = false;
    for(var key in variants){
      if(variants[key].products.length > 0){
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

  function getWarehouses(activeStore){
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


  function getLowestCategory(){
    var lowestCategoryLevel = 0;
    var lowestCategory = false;
    vm.product.Categories.forEach(function(category){
      if(category.CategoryLevel > lowestCategoryLevel){
        lowestCategory = category;
        lowestCategoryLevel = category.CategoryLevel;
      }
    });
    return lowestCategory;
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
    var productCartItems = getProductCartItems(
      vm.productCart.deliveryGroup,
      vm.productCart.quantity
    );

    if(productCartItems.length == 1){
      var item = productCartItems[0];
      var params = {
        id: vm.product.id,
        quantity: item.quantity,
        shipDate: item.date,
        shipCompany: item.company,
        shipCompanyFrom: item.companyFrom
      };
      quotationService.addProduct(vm.product.id, params);      
    }else if(productCartItems.length > 1){
      var multiParams = productCartItems.map(function(item){
        return {
          id: vm.product.id,
          quantity: item.quantity,
          shipDate: item.date,
          shipCompany: item.company,
          shipCompanyFrom: item.companyFrom
        };
      });
      quotationService.addMultipleProducts(multiParams);
    }
  }

  function resetCartQuantity(){
    var available = vm.productCart.deliveryGroup.available;
    if(vm.productCart.quantity >= available){
      vm.productCart.quantity = available;
    }
    else if(!vm.productCart.quantity && available){
      vm.productCart.quantity = 1;
    }
  }

  function getProductCartItems(deliveryGroup, quantity){
    var productCartItems = [];
    var warehouses = [];
     if(deliveryGroup.deliveries.length == 1){
      var productCartItem = deliveryGroup.deliveries[0];
      productCartItem.quantity = quantity;
      productCartItems.push( productCartItem );
    }else{
      var deliveries = deliveryService.sortDeliveriesByHierarchy(
        deliveryGroup.deliveries, 
        vm.warehouses,
        activeStoreWarehouse
      );
      productCartItems = deliveries.map(function(delivery){
        if(quantity > delivery.available){
          delivery.quantity = delivery.available;
          quantity -= delivery.available;
        }else{
          delivery.quantity = quantity;
          quantity = 0;
        }
        return delivery;
      });
      productCartItems = productCartItems.filter(function(item){
        return item.quantity > 0;
      });
    } 
    return productCartItems;
  }

  function showMessageCart(ev) {
    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && vm.customFullscreen;
    $mdDialog.show({
      controller: DialogController,
      templateUrl: 'views/partials/added-to-cart.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: useFullScreen
    })
    .then(function(answer) {
      console.log(answer);
    });
  }

  function getQtyArray(n){
    n = n || 0;
    var arr = [];
    for(var i=0;i<n;i++){
      arr.push(i+1);
    }
    return arr;
  }

  function DialogController($scope, $mdDialog) {
    $scope.hide = function() {
      $mdDialog.hide();
    };
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    $scope.answer = function(answer) {
      $mdDialog.hide(answer);
    };
  }

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
  'deliveryService'
];
/*
angular.element(document).ready(function() {
  angular.bootstrap(document, ['dashexampleApp']);
});
*/
