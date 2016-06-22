'use strict';

/**
 * @ngdoc directive
 * @name dashexampleApp.directive:sidebarCategories
 * @description
 * # sidebarCategories
 */
angular.module('dashexampleApp')
  .directive('sidebarCategories', function (categoriesService, $timeout) {
    return {
      templateUrl: 'views/directives/sidebar-categories.html',
      restrict: 'E',
      scope:{
        categoriesTree: '='
      },
      link: function postLink(scope) {

        scope.init = function(){
          //scope.categoriesTree[0].isActive = true;
          $timeout(function(){
            console.log(scope.categoriesTree);
          }, 4000)
        };

        scope.toggleMainCategory = function(mainCategory,event){
          if(mainCategory.Childs){
            event.preventDefault();
          }

          scope.categoriesTree.forEach(function(category){
            if(category.Handle != mainCategory.Handle){
              category.isActive = false;
            }
          });

          mainCategory.isActive = !mainCategory.isActive;
        };

        scope.toggleCategory = function(category, event){
          console.log(category.Childs);
          if(category.Childs){
            event.preventDefault();
          }
          category.isActive = !category.isActive

        };

        scope.getCategoryIcon = function(handle){
          return categoriesService.getCategoryIcon(handle);
        }


        scope.init();

      }
    };
  });
