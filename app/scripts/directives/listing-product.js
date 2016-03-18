'use strict';

/**
 * @ngdoc directive
 * @name dashexampleApp.directive:listingProduct
 * @description
 * # listingProduct
 */
angular.module('dashexampleApp')
  .directive('listingProduct',['$timeout' ,function ($timeout) {
    return {
      scope:{
        product:'='
      },
      templateUrl: 'views/directives/listing-product.html',
      restrict: 'E',
      link: function postLink(scope, element) {
        scope.areImagesLoaded = false;

        scope.simulateLoad = function(){
          $timeout(function(){
            scope.areImagesLoaded = true;
          },500);
        };

        scope.init = function(){
          scope.simulateLoad();
        };

        scope.init();

      }
    };
  }]);
