'use strict';

/**
 * @ngdoc directive
 * @name actualWebApp.directive:fixedElement
 * @description
 * # fixedElement
 */
angular.module('actualWebApp')
  .directive('fixedElement', function ($window) {
    return function(scope, element, attrs) {
        var top = attrs.top || 70;
        angular.element($window).bind("scroll", function() {
             if (this.pageYOffset >= top) {
                 scope.scrolled = true;
             } else {
                 scope.scrolled = false;
             }
            scope.$apply();
        });
    };
  });
