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
        categoriesTree: '=',
        selectedCategoryId: '='
      },
      link: function postLink(scope) {

        scope.init = function(){
          //scope.categoriesTree[0].isActive = true;
          $timeout(function(){
            scope.showSelectedCategoryId();
          }, 3500)
        };

        scope.showSelectedCategoryId = function(){
          var selected = scope.selectedCategoryId;
          if(scope.categoriesTree){
            scope.categoriesTree.forEach(function(mainCategory){
              var hasSelectedAsChild = _.findWhere(mainCategory.Childs, {id: selected});
              if(mainCategory.id == selected ||  hasSelectedAsChild ){
                mainCategory.isActive = true;
                if(hasSelectedAsChild){
                  mainCategory.Childs.forEach(function(category){
                    var hasSelectedAsChildAux = _.findWhere(category.Childs, {id: selected});
                    if(category.id == selected || hasSelectedAsChildAux){
                      category.isActive = true;
                    }
                  });
                }
              }
            });
          }
        }

        scope.toggleMainCategory = function(mainCategory,event){
          if(mainCategory.Childs){
            event.preventDefault();
          }

          scope.categoriesTree.forEach(function(category){
            if(category.Handle != mainCategory.Handle){
              category.isActive = false;
              //Closing also child categories
              category.Childs.forEach(function(subCategory){
                subCategory.isActive = false;
              });
            }
          });

          mainCategory.isActive = !mainCategory.isActive;

        };

        scope.toggleCategory = function(category, event){
          if(category.Childs){
            event.preventDefault();
          }
          category.isActive = !category.isActive

        };

        scope.getCategoryIcon = function(handle){
          return categoriesService.getCategoryIcon(handle);
        };


        scope.cleanUp = function(){
          scope.categoriesTree.forEach(function(category){
            category.isActive = false;
            //Closing also child categories
            category.Childs.forEach(function(subCategory){
              subCategory.isActive = false;
            });
          });
        };

        scope.$on('$destroy', function() {
          scope.cleanUp();
        });

        scope.init();

      }
    };
  });
