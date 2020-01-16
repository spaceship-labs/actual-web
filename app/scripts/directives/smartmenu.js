'use strict';

/**
 * @ngdoc directive
 * @name actualWebApp.directive:smartMenu
 * @description
 * # smartMenu
 */
angular.module('actualWebApp').directive('smartMenu', SmartMenu);
function SmartMenu() {
  return {
    scope: {
      subcategories: '=',
      image: '=',
      leavehover: '=',
      index: '=',
      featured: '='
    },
    templateUrl: 'views/directives/smart-menu.html',
    restrict: 'E'
  };
}
