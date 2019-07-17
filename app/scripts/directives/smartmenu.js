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
      index: '='
    },
    templateUrl: 'views/directives/smart-menu.html',
    restrict: 'E'
  };
}

  // getCategoriesGroups(): function(req, res) {
  //   Promise.join(
  //     ProductCategory.find({ CategoryLevel: 1 })
  //       .populate('Childs')
  //       .populate('FeaturedProducts'),
  //     ProductCategory.find({ CategoryLevel: 2 })
  //       .populate('Childs')
  //       .populate('FeaturedProducts'),
  //     ProductCategory.find({ CategoryLevel: 3 })
  //       .populate('Parents')
  //       .populate('FeaturedProducts')
  //   )
  //     .then(function(categoriesGroups) {
  //       res.json(categoriesGroups);
  //     })
  //     .catch(function(err) {
  //       console.log(err);
  //       res.negotiate(err);
  //     });
  // },