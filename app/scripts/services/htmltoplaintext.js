'use strict';

/**
 * @ngdoc filter
 * @name actualWebApp.filter:htmlToPlainText
 * @function
 * @description
 * # htmlToPlainText
 * Filter in the actualWebApp.
 */
angular.module('actualWebApp')
  .filter('htmlToPlainText', function () {
   return function(text) {
      return  text ? String(text).replace(/<[^>]+>/gm, '') : '';
    };
  });
