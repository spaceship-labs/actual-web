'use strict';

/**
 * @ngdoc directive
 * @name actualWebApp.directive:cartInformation
 * @description
 * # cartInformation
 */
angular.module('actualWebApp').directive('cartInformation', CartInformation);
function CartInformation() {
  return {
    scope: {
      subcategories: '=',
      image: '=',
      price: '=',
      index: '=',
      discount: '=',
      pieces: '=',
      date: '='
    },
    templateUrl: 'views/directives/cart-information.html',
    restrict: 'E'
  };
}

/* TODO: Create array of objects
* Object prices: total, subtotal, discaount, delivery prices, 
* product info objeoct: img, title name, product detail,  
* cart info: no. products, delivery date, 
* Info payment
*/