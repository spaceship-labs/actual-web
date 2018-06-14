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
      category: '=',
      leavehover: '='
    },
    templateUrl: 'views/directives/smart-menu.html',
    restrict: 'E'
  };
}
