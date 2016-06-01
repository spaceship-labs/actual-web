'use strict';

/**
 * @ngdoc directive
 * @name dashexampleApp.directive:fixedHeader
 * @description
 * # fixedHeader
 */
angular.module('dashexampleApp')
  .directive('fixedHeader', function ($window) {
    return function(scope) {
        angular.element($window).bind("scroll", function() {
             if (this.pageYOffset >= 70) {
                 scope.scrolled = true;
             } else {
                 scope.scrolled = false;
             }
            scope.$apply();
        });
    };
  });
