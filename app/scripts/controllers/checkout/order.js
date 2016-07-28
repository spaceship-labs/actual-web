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

function CheckoutOrderCtrl(commonService ,$routeParams, $rootScope, $location, quotationService, orderService){
  var vm = this;
  vm.init = init;
  vm.print = print;

  vm.isLoading = false;

  function init(){
    //vm.isLoading = false;
    vm.isLoading = true;
    orderService.getById($routeParams.id).then(function(res){
      vm.order = res.data;
      console.log(vm.order);
      vm.order.Details = vm.order.Details || [];
      vm.isLoading = false;
      quotationService.getQuotationProducts(vm.order)
        .then(function(details){
          vm.order.Details = details;
          return quotationService.loadProductFilters(vm.order.Details);
        })
        .then(function(details2){
          vm.order.Details = details2;
        })
    })
    .catch(function(err){
      console.log(err);
      vm.isLoading = false;
    });

  }

  function print(){
    window.print();
  }

  vm.init();

}
