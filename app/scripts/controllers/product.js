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

function ProductCtrl(productService, $location,$routeParams, $q, $timeout,$mdDialog, $mdMedia, $sce, api){
  var vm = this;

  vm.showMessageCart = showMessageCart;
  vm.customFullscreen = $mdMedia('xs') || $mdMedia('sm');


  vm.addToCart = addToCart;
  vm.setupGallery = setupGallery;
  vm.setGalleryIndex = setGalleryIndex;
  vm.trustAsHtml = trustAsHtml;
  vm.loadProductFilters = loadProductFilters;
  vm.init = init;
  vm.sortImages = sortImages;
  vm.loadVariants = loadVariants;
  vm.variants = [];

  vm.toggleVariants = true;

  vm.init($routeParams.id);

  function trustAsHtml(string) {
      return $sce.trustAsHtml(string);
  };

  function init(productId, reload){
    vm.filters = [];
    vm.activeVariants = {};
    vm.galleryImages = [];
    vm.gallery = $(".product-view-gallery").find('slick');
    vm.galleryReel = $('.product-view-gallery-thumbs').find('slick');
    vm.isLoading = true;
    var getVariants = true;

    productService.getById(productId).then(function(res){
      vm.isLoading = false;
      vm.product = productService.formatProduct(res.data.data);
      vm.setupGallery();
      if(reload){
        $location.path('/product/' + productId, false);
        vm.loadProductFilters();
      }else{
        vm.loadVariants().then(function(res){
          vm.variants = res;
          vm.loadProductFilters();
        });
      }

    });
  }



  function setupGallery(){
    vm.imageSizeIndexGallery = 3;
    vm.imageSizeIndexIcon = 9;
    vm.imageSize = api.imageSizes.gallery[vm.imageSizeIndexGallery];
    vm.areImagesLoaded = true;
    vm.sortImages();

    //Adding icon as gallery first image

    if(vm.product.icons[vm.imageSizeIndexIcon]){
      vm.galleryImages.push(vm.product.icons[vm.imageSizeIndexIcon]);
    }else{
      vm.galleryImages.push(vm.product.icons[0]);
    }

    if(vm.product.files){
      vm.product.files.forEach(function(img){
        vm.galleryImages.push({
          url: api.baseUrl + '/uploads/products/gallery/' + vm.imageSize + img.filename
        });
      });
    }

    vm.gallery.on('afterChange',function(e, slick, currentSlide){
      vm.galleryReel.slick('slickGoTo',currentSlide);
    });

  }

  function sortImages(){
    var idsList = vm.product.ImagesOrder.split(',');
    var notSortedImages = [];
    var found = false;

    if(idsList.length > 0 && vm.product.ImagesOrder){
      var baseArr = angular.copy(vm.product.files);
      var orderedList = [];
      idsList.forEach(function(id){
        baseArr.forEach(function(file){
          if(file.id == id){
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
    vm.gallery.slick('slickGoTo',index);
  }

  function loadProductFilters(){
    productService.getAllFilters({quickread:true}).then(function(res){
      vm.filters = res.data;

      var filters = vm.filters.map(function(filter){
        filter.Values = [];
        vm.product.FilterValues.forEach(function(value){
          if(value.Filter == filter.id){
            filter.Values.push(value);
            for(var key in vm.variants){
              var variant = vm.variants[key];
              variant.filterValues.map(function(variantValue){
                if(variantValue.value.id == value.id ){
                  variantValue.selected = true;
                }else{
                  variantValue.selected = false;
                }
                return variantValue
              });
            }

          }
        })
        return filter;
      });

      vm.filters = filters.filter(function(filter){
        return filter.Values.length > 0;
      });

      console.log(vm.variants);


    });
  }

  function loadVariants(){
    var variantGroup = false;
    var deferred = $q.defer();

    vm.product.Groups.forEach(function(group){
      if(group.Type === 'variations'){
        variantGroup = group;
      }
    });
    if(variantGroup){
      productService.getGroupVariants(variantGroup.id).then(function(res){
        deferred.resolve(res.data);
      });
    }

    return deferred.promise;
  }

  function addToCart($event){
    console.log('addToCart');
    console.log(vm.customFullscreen);
    vm.showMessageCart($event);
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
  };

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
