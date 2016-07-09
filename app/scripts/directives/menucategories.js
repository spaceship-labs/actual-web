'use strict';

/**
 * @ngdoc directive
 * @name dashexampleApp.directive:menuCategories
 * @description
 * # menuCategories
 */
angular.module('dashexampleApp')
  .directive('menuCategories', function () {
    return {
      templateUrl: 'views/directives/menu-categories.html',
      restrict: 'E',
      scope:{
        categories: '='
      },
      link: function postLink(scope, element, attrs) {
        scope.categories = scope.categories || [];

        scope.toggleMenuSubCategory = function(index, category){
          scope.categories.forEach(function(subcategory, i){
            if(i != index){
              subcategory.isActive = false;
            }
          });
          category.isActive = !category.isActive;
        }

        scope.$on('$routeChangeStart', function(next, current) {
          if(scope.categories){
            scope.categories.forEach(function(subcategory){
              subcategory.isActive = false;
            });
          }
        });

      }
    };
  });
