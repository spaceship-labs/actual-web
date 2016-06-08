'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:CartCtrl
 * @description
 * # CartCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('CartCtrl', CartCtrl);

function CartCtrl($location,$routeParams, $q ,productService, commonService){
  var vm = this;

  vm.qty = 1;



}
