'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:CategoryCtrl
 * @description
 * # CategoryCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('CategoryCtrl', CategoryCtrl);

function CategoryCtrl(){
  var vm = this;

  vm.subnavIndex = 0;
  vm.setSubnavIndex = setSubnavIndex;

  function setSubnavIndex(index){
    vm.subnavIndex = index;
  }
}
