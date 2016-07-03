'use strict';

/**
 * @ngdoc directive
 * @name dashexampleApp.directive:menuSubCategories
 * @description
 * # menuSubCategories
 */
angular.module('dashexampleApp')
  .directive('menuSubCategories', function () {
    return {
      templateUrl: 'views/directives/menu-subcategories.html',
      restrict: 'E',
      scope:{
        parentCategory: '='
      },
      link: function postLink(scope, element, attrs) {
      }
    };
  });
