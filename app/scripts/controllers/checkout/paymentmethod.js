'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:CheckoutPaymentmethodCtrl
 * @description
 * # CheckoutPaymentmethodCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('CheckoutPaymentmethodCtrl', CheckoutPaymentmethodCtrl);

function CheckoutPaymentmethodCtrl($routeParams ,categoriesService, productService){
  var vm = this;

  vm.selectSingle = selectSingle;
  vm.selectMultiple = selectMultiple;

  vm.singlePayment = true;
  vm.multiplePayment = false;

  function selectSingle(){
    console.log('selectSingle');
    vm.singlePayment = true;
    vm.multiplePayment = false;

  }

  function selectMultiple(){
    console.log('selectMultiple');
    vm.multiplePayment = true;
    vm.singlePayment = false;
  }


}
