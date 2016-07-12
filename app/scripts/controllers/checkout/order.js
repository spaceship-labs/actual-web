'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:CheckoutOrderCtrl
 * @description
 * # CheckoutOrderCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('CheckoutOrderCtrl', CheckoutOrderCtrl);

function CheckoutOrderCtrl(commonService ,$routeParams, $rootScope, $location ,categoriesService, productService, quotationService, clientService, orderService){
  var vm = this;
  vm.init = init;
  vm.print = print;

  vm.isLoading = false;

  function init(){
    vm.isLoading = false;
  }

  function print(){
    window.print();
  }

  vm.init();

}
