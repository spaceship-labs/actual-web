'use strict';

/**
 * @ngdoc directive
 * @name actualWebApp.directive:listingProduct
 * @description
 * # listingProduct
 */
angular.module('actualWebApp').directive('listingProduct', [
  '$rootScope',
  '$timeout',
  'api',
  'commonService',
  function($rootScope, $timeout, api, commonService) {
    return {
      scope: {
        product: '='
      },
      templateUrl: 'views/directives/listing-product.html',
      restrict: 'E',
      link: function postLink(scope) {
        scope.siteTheme = $rootScope.siteTheme;
        scope.areImagesLoaded = false;
        scope.images = [];
        scope.activeStore = $rootScope.activeStore;

        scope.setUpImages = function() {
          scope.imageSizeIndexGallery = 2;
          scope.imageSizeThumbnailIndex = 2;
          //console.log('scope.products.icons', scope.product.icons);
          scope.imageSize = api.imageSizes.gallery[scope.imageSizeIndexGallery];

          if (scope.product.icons[scope.imageSizeThumbnailIndex]) {
            scope.images.push(
              scope.product.icons[scope.imageSizeThumbnailIndex]
            );
          } else {
            scope.images.push(scope.product.icons[0]);
          }

          //If populated images of product, load them in images array
          if (scope.product.files) {
            scope.imageSize = '';
            scope.product.files.forEach(function(img) {
              scope.images.push({
                url:
                  api.cdnUrl +
                  '/uploads/products/gallery/' +
                  img.filename +
                  '?d=' +
                  scope.imageSize
              });
            });
          }
          //console.log('scope.images', scope.images);

          $timeout(function() {
            scope.areImagesLoaded = true;
          }, 500);
        };

        scope.init = function() {
          scope.setUpImages();
        };

        scope.roundCurrency = function(ammount) {
          ammount = commonService.roundIntegerCurrency(ammount);
          return ammount;
        };

        scope.ezOptions = {
          constrainType: 'height',
          constrainSize: 274,
          zoomType: 'lens',
          containLensZoom: true,
          cursor: 'pointer'
        };

        scope.init();
      }
    };
  }
]);
