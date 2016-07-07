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

function CheckoutPaymentmethodCtrl($routeParams, $scope, $mdMedia, $mdDialog ,categoriesService, productService){
  var vm = this;

  vm.selectSingle = selectSingle;
  vm.selectMultiple = selectMultiple;
  vm.applyDeposit = applyDeposit;

  vm.customFullscreen = $mdMedia('xs') || $mdMedia('sm');

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

  function applyDeposit(ev) {
    console.log('applyDeposit');
    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && vm.customFullscreen;
    $mdDialog.show({
      controller: DepositController,
      templateUrl: 'views/checkout/deposit-dialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: useFullScreen
    })
    .then(function(answer) {
      vm.status = 'You said the information was "' + answer + '".';
    }, function() {
      vm.status = 'You cancelled the dialog.';
    });

  }

  function DepositController($scope, $mdDialog) {
    $scope.hide = function() {
      $mdDialog.hide();
    };
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    $scope.answer = function(answer) {
      $mdDialog.hide(answer);
    };
  }


}
