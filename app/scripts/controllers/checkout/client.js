'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:CheckoutClientCtrl
 * @description
 * # CheckoutClientCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('CheckoutClientCtrl', CheckoutClientCtrl);

function CheckoutClientCtrl(commonService ,$timeout ,$routeParams, $rootScope, $location ,categoriesService, productService, quotationService, clientService, orderService){
  var vm = this;
  angular.extend(vm,{
    continueProcess: continueProcess,
    init: init,
  });

  function init(){
    vm.isLoading = true;
    quotationService.getById($routeParams.id).then(function(res){
      vm.quotation = res.data;
      vm.isLoading = false;
      //fillin address data with client info
      if(!vm.quotation.Address){
        console.log('No habia direccion');
        vm.setAddress();
      }
      quotationService.getQuotationProducts(vm.quotation).then(function(details){
        vm.quotation.Details = details;
        vm.totalProducts = quotationService.calculateItemsNumber(vm.quotation);
      });
    });
  }


  function continueProcess(){
    vm.isLoading = true;
    var params = angular.copy(vm.quotation);
    //delete params.Details;

    if(params.Details){
      params.Details = params.Details.map(function(detail){
        detail.Product = detail.Product.id;
        return detail;
      });
    }

    quotationService.update(vm.quotation.id, params).then(function(res){
      vm.isLoading = false;
      $location.path('/checkout/paymentmethod/' + vm.quotation.id);
    });
  }


  vm.init();

}
