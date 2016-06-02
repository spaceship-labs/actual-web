'use strict';

/**
 * @ngdoc directive
 * @name dashexampleApp.directive:listingProduct
 * @description
 * # listingProduct
 */
angular.module('dashexampleApp')
  .directive('listingProduct',['$timeout','api' ,function ($timeout, api) {
    return {
      scope:{
        product:'='
      },
      templateUrl: 'views/directives/listing-product.html',
      restrict: 'E',
      link: function postLink(scope) {
        scope.areImagesLoaded = false;
        scope.images = [];

        scope.setUpImages = function(){
          scope.imageSizeIndexGallery = 4;
          scope.imageSizeIndexIcon = 10;
          scope.imageSize = api.imageSizes.gallery[scope.imageSizeIndexGallery];
          console.log(api.imageSizes.gallery);

          $timeout(function(){
            scope.areImagesLoaded = true;

            //Adding icon as gallery first image
            if(scope.product.icons[scope.imageSizeIndexIcon]){
              console.log('product icons: ',scope.product.icons);

              scope.images.push(scope.product.icons[scope.imageSizeIndexIcon]);
            }else{
              scope.images.push(scope.product.icons[0]);
            }

            if(scope.product.files){
              scope.product.files.forEach(function(img){
                console.log('image url: ', api.baseUrl + '/uploads/products/gallery/' + scope.imageSize + img.filename);
                scope.images.push({
                  url: api.baseUrl + '/uploads/products/gallery/' + scope.imageSize + img.filename
                });
              });
            }
          },500);
        };

        scope.init = function(){
          scope.setUpImages();
        };

        scope.init();

      }
    };
  }]);
