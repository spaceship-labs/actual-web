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
      templateUrl: 'views/direcitves/listing-product.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        element.text('this is the listingProduct directive');
      }
    };
  });
