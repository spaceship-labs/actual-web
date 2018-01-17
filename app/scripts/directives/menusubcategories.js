'use strict';

/**
 * @ngdoc directive
 * @name actualWebApp.directive:menuSubCategories
 * @description
 * # menuSubCategories
 */
angular.module('actualWebApp')
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
