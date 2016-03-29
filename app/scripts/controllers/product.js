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

function ProductCtrl(productService, $routeParams, $timeout,$mdDialog, $mdMedia, api){
  var vm = this;

  vm.showMessageCart = showMessageCart;
  vm.customFullscreen = $mdMedia('xs') || $mdMedia('sm');
  vm.galleryImages = [];
  vm.gallery = $(".product-view-gallery").find('slick');
  vm.galleryReel = $('.product-view-gallery-thumbs').find('slick');

  vm.addToCart = addToCart;
  vm.setupGallery = setupGallery;
  vm.setGalleryIndex = setGalleryIndex;
  vm.init = init;

  vm.init();

  function init(){
    productService.getById($routeParams.id).then(function(res){
      vm.product = productService.formatProduct(res.data.data);
      vm.setupGallery();
    });
  }

  function setupGallery(){
    vm.imageSizeIndexGallery = 3;
    vm.imageSizeIndexIcon = 9;
    vm.imageSize = api.imageSizes.gallery[vm.imageSizeIndexGallery];
    vm.areImagesLoaded = true;

    //Adding icon as gallery first image
    console.log(vm.product.icons);

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
      console.log(currentSlide);
      vm.galleryReel.slick('slickGoTo',currentSlide);
    });

  }

  function setGalleryIndex(index){
    vm.gallery.slick('slickGoTo',index);
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
