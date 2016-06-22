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

function CartCtrl($location,$routeParams, $q ,productService, commonService, quotationService){
  var vm = this;

  vm.qty = 1;

  vm.init = init;

  function init(){
    quotationService.getById($routeParams.id).then(function(res){
      console.log(res);
    });
  }

  vm.init();

}
