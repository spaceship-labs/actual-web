'use strict';

/**
 * @ngdoc filter
 * @name dashexampleApp.filter:htmlToPlainText
 * @function
 * @description
 * # htmlToPlainText
 * Filter in the dashexampleApp.
 */
angular.module('dashexampleApp')
  .filter('htmlToPlainText', function () {
   return function(text) {
      return  text ? String(text).replace(/<[^>]+>/gm, '') : '';
    };
  });
