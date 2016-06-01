'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:CreateClientCtrl
 * @description
 * # CreateClientCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('CreateClientCtrl', CreateClientCtrl);

function CreateClientCtrl($location,$routeParams, $q ,productService){
  var vm = this;

  vm.activeTab = 0;

}
