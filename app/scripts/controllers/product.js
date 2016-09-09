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
  api,
  cartService,
  quotationService,
  pmPeriodService,
  localStorageService
) {
  var vm = this;
  var activeStoreId        = localStorageService.get('activeStore'); 
  var activeStore          = false;
  var activeStoreWarehouse = false;


  angular.extend(vm, {
    customFullscreen: ($mdMedia('xs') || $mdMedia('sm') ),
    toggleVariants: true,
    variants: [],
    opts: {
      index:0,
      history: false,
      hideAnimationDuration: 0,
      showAnimationDuration: 0,
      shareEl: false
    },
    applyDiscount: applyDiscount,
    addToCart: addToCart,
    closeGallery: closeGallery,
    getGroupProducts: getGroupProducts,
    getQtyArray: getQtyArray,
    getWarehouseName: getWarehouseName,
    getPiecesString: getPiecesString,
    init: init,
    resetCartQuantity: resetCartQuantity,
    setGalleryIndex: setGalleryIndex,
    showGallery: showGallery,
    showMessageCart: showMessageCart,
    trustAsHtml: trustAsHtml,
  });

  var FILTERS_VARIANTS = [
    {id:'5743703aef7d5e62e508e22d', key:'color', handle:'color', name: 'Color'},
    {id:'5743703aef7d5e62e508e223', key:'forma', handle:'forma', name: 'Forma'},
    {id:'5743703aef7d5e62e508e220', key:'tamano', handle:'tamano-camas-y-blancos-cama', name: 'Tamaño'},
    {id:'5743703aef7d5e62e508e226', key:'firmeza', handle: 'firmeza', name: 'Firmeza'}
  ];  

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
        vm.product = fProduct;
        vm.mainPromo = vm.product.mainPromo;
        vm.lowestCategory = getLowestCategory();
        vm.productCart = {
          quantity: 1
        };
        setupGallery();
        if(reload){
          $location.path('/product/' + productId, false);
          loadProductFilters();
        }else{
          loadProductFilters();
          loadVariants();
        }
        vm.isLoading = false;
        return productService.delivery(productId, activeStoreId);
      })
      .then(function(delivery){
        var locations   = delivery.reduce(function(acum, current){
          if (acum.indexOf(current.companyFrom) == -1) {
            return acum.concat(current.companyFrom);
          }
          return acum;
        }, []);
        vm.available = locations.reduce(function(acum, location) {
          return acum + delivery.reduce(function(acum, current) {
            if (current.companyFrom == location &&  current.available > acum ){
              return current.available;
            }
            return acum;
          }, 0);
        }, 0);
        vm.deliveries  = delivery;
        vm.deliveriesGroups = groupDeliveryDates(vm.deliveries);

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

    getWarehouses();
  }

  function getPiecesString(stock){
    var str = 'piezas';
    if(stock == 1){
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

  $rootScope.$on('activeStoreAssigned',function(e,data){
    activeStore = data;
    getWarehouses();
  });

  function getWarehouses(){
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

  function getImageSizes(){
    var promises = [];
    var getImageSize = function(galleryImg){
      var deferred = $q.defer();
      var img = new Image();
      img.src = galleryImg.src;
      img.onload = function(){
        galleryImg.w = this.width;
        galleryImg.h = this.height;
        $scope.$apply();
        deferred.resolve();
      };
      return deferred.promise;
    }
    for(var i=0;i<vm.galleryImages.length;i++){
      promises.push( getImageSize(vm.galleryImages[i]) );
    }
    $q.all(promises)
      .then(function(){
        vm.loadedSizes = true;
      })
      .catch(function(err){
        $log.error(err);
      })
  }

  function applyDiscount(discount, price){
    var result = price;
    result = price - ( ( price / 100) * discount );
    return result;
  }

  function trustAsHtml(string) {
    return $sce.trustAsHtml(string);
  }

  function closeGallery() {
    vm.open = false;
  }

  function showGallery (i) {
    if(vm.loadedSizes){
      if(angular.isDefined(i)) {
        vm.opts.index = i;
      }
      vm.open = true;
    }
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

  function getGroupProducts(){
    var variantGroup = false;
    vm.product.Groups.forEach(function(group){
      if(group.Type === 'variations'){
        variantGroup = group;
      }
    });
    if(variantGroup && variantGroup.id){
      var query = {
        id: variantGroup.id
      };
      return productService.getGroupProducts(query);
    }
    var deferred = $q.defer();
    deferred.resolve({});
    return deferred.promise;
  }

  function loadVariants(){
    vm.getGroupProducts()
      .then(function(result){

        vm.variants = {};
        var valuesIds = [];
        var products = result.data || [];
        if(products.length > 0){

          FILTERS_VARIANTS.forEach(function(filter){
            vm.variants[filter.key] = {};
            angular.copy(filter, vm.variants[filter.key]);
            vm.variants[filter.key].products = [];
          });

          products.forEach(function( product ){
            FILTERS_VARIANTS.forEach(function (filter){
              var values = _.where( product.FilterValues, { Filter: filter.id } );
              values.forEach(function(val){
                val.product = product.ItemCode;
                valuesIds.push(val.id);
              });
              if(values.length > 0){
                var aux = {id: product.ItemCode, filterValues : values};
                vm.variants[filter.key].products.push(aux);
                vm.hasVariants = true;
              }
            });
          });
        }

      });
  }

  function setupGallery(){
    setupImages();
    $timeout(function(){
      vm.gallery = $("#slick-gallery");
      vm.galleryReel = $('#slick-thumbs');
      vm.gallery.on('afterChange',function(e, slick, currentSlide){
        $timeout(function(){
          vm.galleryReel.slick('slickGoTo',currentSlide);
          vm.selectedSlideIndex = currentSlide;
        },0);
      });
      getImageSizes();
    }, 1000);    
  }


  function setupImages(){
    var imageSizeIndexGallery = 2;
    var imageSizeIndexIcon = 1;
    vm.selectedSlideIndex = 0;
    vm.areImagesLoaded = true;

    var imageSize = api.imageSizes.gallery[imageSizeIndexGallery];
    sortImages();
    if(vm.product.icons.length >= 0){
      var img = {
        src: vm.product.icons[0].url,
        w:500,
        h:500
      };
      vm.galleryImages.push(img);
    }

    if(vm.product.files){
      //TEMPORAL
      imageSize = '';
      vm.product.files.forEach(function(img){
        vm.galleryImages.push({
          src: api.baseUrl + '/uploads/products/gallery/' + imageSize + img.filename,
          w: 500,
          h: 500
        });
      });
    }
  }

  function sortImages(){
    var idsList = vm.product.ImagesOrder ? vm.product.ImagesOrder.split(',') : [];
    var unSortedImages = [];
    if(idsList.length > 0 && vm.product.ImagesOrder){
      var files = angular.copy(vm.product.files);
      var orderedList = [];
      for(var i=0;i<idsList.length;i++){
        for(var j=0; j<files.length;j++){
          if(files[j].id === idsList[i]){
            orderedList.push(files[j]);
          }          
        }
      }
      //Checking if a file was not in the orderedList
      files.forEach(function(file){
        if( !_.findWhere(orderedList, {id: file.id}) ){
          orderedList.push(file);
        }
      });
      orderedList.concat(unSortedImages);
      vm.product.files = orderedList;
    }
  }

  function setGalleryIndex(index){
    vm.selectedSlideIndex = index;
    vm.gallery.slick('slickGoTo',index);
  }

  function loadProductFilters(){
    productService.getAllFilters({quickread:true})
      .then(function(res){
        var data = res.data || [];
        var filters = data.map(function(filter){
          filter.Values = [];
          vm.product.FilterValues.forEach(function(value){
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
      })
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
        }
      });
      quotationService.addMultipleProducts(multiParams);
    }
  }

  function resetCartQuantity(){
    var available = vm.productCart.deliveryGroup.available;
    if(vm.productCart.quantity > available){
      vm.productCart.quantity = available;
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
      var deliveries = sortDeliveries(deliveryGroup.deliveries);
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

  function sortDeliveries(deliveries){
    var sortedDeliveries = [];
    var warehouses = deliveries.map(function(delivery){
      var warehouse = _.findWhere(vm.warehouses, {
        id: delivery.companyFrom
      });
      return warehouse;
    });
    warehouses = sortWarehousesByHierarchy(warehouses);
    for(var i = 0; i < warehouses.length; i++){
      var delivery = _.findWhere(deliveries, {companyFrom: warehouses[i].id});
      sortedDeliveries.push( delivery );
    }
    return sortedDeliveries;    
  }

  function sortWarehousesByHierarchy(warehouses){
    var region = activeStoreWarehouse.region;
    var sorted = [];
    var rules  = getWarehousesRules(region, warehouses);
    
    for(var i=0;i<rules.length;i++){
      for(var j=0;j<warehouses.length;j++){
        var hash = getWarehouseHash(warehouses[j]);
        if(!warehouses[j].sorted && hash == rules[i]){
          sorted.push(warehouses[j]);
          warehouses[j].sorted = true;
        }
      }
    }
    return sorted;
  }

  function getWarehouseHash(warehouse){
    var hash = warehouse.cedis ? 'cedis#' : '#';
    hash += warehouse.region;
    return hash;
  }

  function getWarehousesRules(region, warehouses){
    var otherRegions = warehouses.filter(function(whs){
      return whs.region != region;
    });
    var rulesHashes = [
      'cedis#' + region,
      '#'+region,
    ];
    if(otherRegions.length > 0){
      for(var i=0;i<otherRegions.length;i++){
        rulesHashes.push('cedis#'+otherRegions[i]);
        rulesHashes.push('#'+otherRegions[i])
      }
    }
    return rulesHashes;
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
    })
  }

  function getQtyArray(n){
    n = n || 0;
    var arr = [];
    for(var i=0;i<n;i++){
      arr.push(i+1);
    }
    return arr;
  }

  function groupDeliveryDates(deliveries){
    var groups = [];
    for(var i=0;i<deliveries.length;i++){
      var items = _.where(deliveries, {
        date: deliveries[i].date,
        available: deliveries[i].available
      });
      var group = {
        days: deliveries[i].days,
        date: deliveries[i].date,
        hash: deliveries[i].date + '#' + deliveries[i].available,
        deliveries: items,
      };
      groups.push(group);
    }
    groups = _.uniq(groups, false, function(g){
      return g.hash;
    });
    groups = groups.map(function(g){
      g.available = g.deliveries.reduce(function(acum, delivery){
        acum+= delivery.available;
        return acum;
      }, 0);
      return g;
    });
    return groups;
    //return deliveries;
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
  'api',
  'cartService',
  'quotationService',
  'pmPeriodService',
  'localStorageService'
];
/*
angular.element(document).ready(function() {
  angular.bootstrap(document, ['dashexampleApp']);
});
*/
