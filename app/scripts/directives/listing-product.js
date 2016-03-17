'use strict';

/**
 * @ngdoc directive
 * @name dashexampleApp.directive:listingProduct
 * @description
 * # listingProduct
 */
angular.module('dashexampleApp')
  .directive('listingProduct', function () {
    return {
      scope:{
        product:'='
      },
      templateUrl: 'views/directives/listing-product.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {

      }
    };
  });
