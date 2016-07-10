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

function CheckoutPaymentmethodCtrl($routeParams, $rootScope, $scope, $mdMedia, $mdDialog ,quotationService, productService, orderService){
  var vm = this;

  vm.selectSingle = selectSingle;
  vm.selectMultiple = selectMultiple;
  vm.applyDeposit = applyDeposit;
  vm.createOrder = createOrder;

  vm.customFullscreen = $mdMedia('xs') || $mdMedia('sm');

  vm.singlePayment = true;
  vm.multiplePayment = false;

  vm.init = init;
  vm.getProducts = getProducts;
  vm.getTotalPrice = getTotalPrice;
  vm.getTotalProducts = getTotalProducts;

  function init(){
    vm.isLoading = true;
    quotationService.getById($routeParams.id).then(function(res){
      vm.isLoading = false;
      vm.quotation = res.data;
      console.log(vm.quotation);
      var productsIds = [];
      vm.quotation.Details.forEach(function(detail){
        productsIds.push(detail.Product);
      });
      vm.getProducts(productsIds);
    });
  }


  function selectSingle(){
    vm.singlePayment = true;
    vm.multiplePayment = false;

  }

  function selectMultiple(){
    vm.multiplePayment = true;
    vm.singlePayment = false;
  }

  function applyDeposit(ev) {
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
      if(!vm.quotation.Order){
        vm.createOrder();
      }else{
        var params = {
          ammount: 1200,
          currency: 'MXP',
          verificationCode: '8870',
          terminal: 'TPV Banorte'
        }
        vm.addPayment();
      }
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

  function addPayment(orderId,params){
    return orderService.addPayment();
  }

  function createOrder(){
    var params = {
      total: vm.getTotalPrice(),
      Details: vm.quotation.Details,
      SlpCode: $rootScope.user.SlpCode,
      CardCode: vm.client.CardCode,
      currency: 'MXP',
      status:'pending',
      Payments: []
    };
    //Merging quotation address with order
    params = _.extend(params, vm.quotation.Address)
    vm.createOrder(params);
    orderService.create(params).then(function(res){
      vm.order = res.data;
      vm.quotation.Order = vm.order.id;
    });
  }



  function getProducts(productsIds){
    var params = {
      filters: {
        id: productsIds
      },
      populate_fields: ['FilterValues']
    };
    var page = 1;
    productService.getList(page,params).then(function(res){
      var products = productService.formatProducts(res.data.data);

      //Match detail - product
      vm.quotation.Details.forEach(function(detail){
        //Populating detail with product info.
        detail.Product = _.findWhere( products, {id : detail.Product } );
      });

    });
  }

  function getTotalPrice(){
    var total = 0;
    if(vm.quotation && vm.quotation.Details){
      total = quotationService.calculateTotal(vm.quotation.Details);
    }
    return total;
  }

  function getTotalProducts(){
    var total = 0;
    if(vm.quotation && vm.quotation.Details){
      total = quotationService.calculateItemsNumber(vm.quotation.Details)
    }
    return total;
  }

  vm.init();


}
