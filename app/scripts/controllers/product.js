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
    getImageSizes: getImageSizes,
    getLowestCategory: getLowestCategory,
    init: init,
    loadProductFilters: loadProductFilters,
    loadVariants: loadVariants,
    setGalleryIndex: setGalleryIndex,
    setupGallery: setupGallery,
    showGallery: showGallery,
    showMessageCart: showMessageCart,
    sortImages: sortImages,
    trustAsHtml: trustAsHtml,
  });

  vm.init($routeParams.id);


  function init(productId, reload){
    vm.filters = [];
    vm.activeVariants = {};
    vm.galleryImages = [];
    vm.isLoading = true;

    productService.getById(productId)
      .then(function(res){
        return productService.formatSingleProduct(res.data.data);
      })
      .then(function(fProduct){
        vm.product = fProduct;
        vm.mainPromo = vm.product.mainPromo;
        vm.lowestCategory = vm.getLowestCategory();
        vm.product.cart = {
          quantity: 1
        };
        vm.setupGallery();
        if(reload){
          $location.path('/product/' + productId, false);
          vm.loadProductFilters();
        }else{
          vm.loadProductFilters();
          vm.loadVariants();
        }
        vm.isLoading = false;

        var companyActive = localStorageService.get('companyActive');
        return productService.delivery(productId, companyActive);
      })
      .then(function(delivery){
        vm.available = delivery.reduce(function(acum, current) {
          current.available = parseInt(current.available);
          return acum + current.available;
        }, 0);
        vm.deliveries  = delivery;
        if(vm.deliveries && vm.deliveries.length > 0){
          vm.product.cart.delivery = vm.deliveries[0];
        }

        return productService.addSeenTime(vm.product.ItemCode);
      })
      .then(function(seenTime){
        console.log(seenTime);
      })
      .catch(function(err){
        console.log(err);
      });

    pmPeriodService.getActive().then(function(res){
      vm.validPayments = res.data;
    });

  }

  function getImageSizes(){
    var getImageSize = function(galleryImg, callback){
      var img = new Image();
      img.src = galleryImg.src;
      img.onload = function(){
        galleryImg.w = this.width;
        galleryImg.h = this.height;
        $scope.$apply();
        callback();
      };
    }
    async.forEachSeries(vm.galleryImages ,getImageSize, function(err){
      if(err) console.log(err);
      vm.loadedSizes = true;
      console.log(vm.loadedSizes);
      $scope.$apply();
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
    var deferred = $q.defer();
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
      productService.getGroupProducts(query).then(function(res){
        deferred.resolve(res.data);
      });
    }
    return deferred.promise;
  }



  function loadVariants(){
    vm.getGroupProducts().then(function(products){
      vm.variants = {};
      var valuesIds = [];

      var filtersVariants = [
        {id:'5743703aef7d5e62e508e22d', key:'color', handle:'color', name: 'Color'},
        {id:'5743703aef7d5e62e508e223', key:'forma', handle:'forma', name: 'Forma'},
        {id:'5743703aef7d5e62e508e220', key:'tamano', handle:'tamano-camas-y-blancos-cama', name: 'Tamaño'},
        {id:'5743703aef7d5e62e508e226', key:'firmeza', handle: 'firmeza', name: 'Firmeza'}
      ];

      filtersVariants.forEach(function(filter){
        vm.variants[filter.key] = {};
        angular.copy(filter, vm.variants[filter.key]);
        vm.variants[filter.key].products = [];
      });

      products.forEach(function( product ){
        filtersVariants.forEach(function (filter){
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

    });
  }

  function setupGallery(){
    vm.imageSizeIndexGallery = 2;
    vm.imageSizeIndexIcon = 1;
    vm.selectedSlideIndex = 0;
    vm.imageSize = api.imageSizes.gallery[vm.imageSizeIndexGallery];
    vm.areImagesLoaded = true;
    vm.sortImages();
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
      vm.imageSize = '';
      vm.product.files.forEach(function(img){
        vm.galleryImages.push({
          src: api.baseUrl + '/uploads/products/gallery/' + vm.imageSize + img.filename,
          w: 500,
          h: 500
        });
      });
    }

    $timeout(function(){

      vm.gallery = $("#slick-gallery");
      vm.galleryReel = $('#slick-thumbs');

      vm.gallery.on('afterChange',function(e, slick, currentSlide){
        $timeout(function(){
          vm.galleryReel.slick('slickGoTo',currentSlide);
          vm.selectedSlideIndex = currentSlide;
        },0);
      });

      vm.getImageSizes();

    }, 1000);


  }

  function sortImages(){
    var idsList = vm.product.ImagesOrder ? vm.product.ImagesOrder.split(',') : [];
    var notSortedImages = [];

    if(idsList.length > 0 && vm.product.ImagesOrder){
      var baseArr = angular.copy(vm.product.files);
      var orderedList = [];
      idsList.forEach(function(id){
        baseArr.forEach(function(file){
          if(file.id === id){
            orderedList.push(file);
          }
        });
      });

      //Checking if a file was not in the orderedList
      baseArr.forEach(function(file){
        if( !_.findWhere(orderedList, {id: file.id}) ){
          orderedList.push(file);
        }
      });

      orderedList.concat(notSortedImages);
      vm.product.files = orderedList;
    }
  }

  function setGalleryIndex(index){
    vm.selectedSlideIndex = index;
    vm.gallery.slick('slickGoTo',index);
  }

  function loadProductFilters(){
    productService.getAllFilters({quickread:true}).then(function(res){
      vm.filters = res.data;

      var filters = vm.filters.map(function(filter){
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


    });
  }


  function addToCart($event){
    //cartService.addToCart(vm.product.id, params);
    var params = {quantity: vm.product.cart.quantity};
    vm.isLoading = true;
    quotationService.addProduct(vm.product.id, params);
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
