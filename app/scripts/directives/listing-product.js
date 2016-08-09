'use strict';

/**
 * @ngdoc directive
 * @name dashexampleApp.directive:listingProduct
 * @description
 * # listingProduct
 */
angular.module('dashexampleApp')
  .directive('listingProduct',['$timeout','api', 'commonService' ,function ($timeout, api, commonService) {
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

          $timeout(function(){
            scope.areImagesLoaded = true;

            //Adding icon as gallery first image
            if(scope.product.icons[scope.imageSizeIndexIcon]){
              scope.images.push(scope.product.icons[0]);
            }else{
              scope.images.push(scope.product.icons[0]);
            }

            if(scope.product.files){
              scope.imageSize = '';
              scope.product.files.forEach(function(img){
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

        scope.roundCurrency = function(ammount){
          ammount = commonService.roundIntegerCurrency(ammount);
          return ammount;
        }

        scope.ezOptions = {
          constrainType: "height",
          constrainSize: 274,
          zoomType: "lens",
          containLensZoom: true,
          cursor: 'pointer',
        };

        scope.init();

      }
    };
  }]);
