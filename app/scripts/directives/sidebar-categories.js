'use strict';

/**
 * @ngdoc directive
 * @name dashexampleApp.directive:sidebarCategories
 * @description
 * # sidebarCategories
 */
angular.module('dashexampleApp')
  .directive('sidebarCategories', function (categoriesService) {
    return {
      templateUrl: 'views/directives/sidebar-categories.html',
      restrict: 'E',
      link: function postLink(scope) {

        scope.init = function(){
          scope.categories[0].isActive = true;
        };

        scope.categories = categoriesService.getCategories();

        scope.toggleCategory = function(category,event){
          console.log(category.subcategories);
          if(category.subcategories){
            event.preventDefault();
          }
          category.isActive = !category.isActive;
        };

        scope.toggleSubCategory = function(subCategory, event){
          console.log(subCategory.groups);
          if(subCategory.groups){
            event.preventDefault();
          }
          subCategory.isActive = !subCategory.isActive

        };


        scope.init();

      }
    };
  });
