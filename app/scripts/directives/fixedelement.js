'use strict';

/**
 * @ngdoc directive
 * @name dashexampleApp.directive:fixedElement
 * @description
 * # fixedElement
 */
angular.module('dashexampleApp')
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
