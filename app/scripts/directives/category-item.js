'use strict';

/**
 * @ngdoc directive
 * @name dashexampleApp.directive:categoryItem
 * @description
 * # categoryItem
 */
angular.module('dashexampleApp')
  .directive('categoryItem',['api','$rootScope' ,function (api,$rootScope) {
    return {
      scope:{
        activeStore:'=',
        category: '=',
        stockKey:'@'
      },
      templateUrl: 'views/directives/category-item.html',
      restrict: 'E',
      link: function postLink(scope) {

        scope.getCategoryBackground = function(handle){
          var image =  '/images/mesas.jpg';
          image = api.baseUrl + '/categories/' + handle + '.jpg';
          return {'background-image' : 'url(' + image + ')'};
        };

        scope.getCategoryImage = function(handle){
          var image =  '/images/mesas.jpg';
          var subfolder = $rootScope.siteTheme;
          image = api.baseUrl + '/categories/' + subfolder +'/' + handle + '.jpg';
          return image;
        };


      }
    };
  }]);
