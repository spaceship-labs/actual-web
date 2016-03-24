'use strict';

/**
 * @ngdoc directive
 * @name dashexampleApp.directive:sidebarCategories
 * @description
 * # sidebarCategories
 */
angular.module('dashexampleApp')
  .directive('sidebarCategories', function () {
    return {
      templateUrl: 'views/directives/sidebar-categories.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        scope.subnavIndex = 0;

        scope.setSubnavIndex = function(index){
          scope.subnavIndex = index;
        }

      }
    };
  });
