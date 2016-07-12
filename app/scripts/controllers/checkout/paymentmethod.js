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
  vm.applyTransaction = applyTransaction;
  vm.createOrder = createOrder;

  vm.customFullscreen = $mdMedia('xs') || $mdMedia('sm');

  vm.singlePayment = true;
  vm.multiplePayment = false;

  vm.init = init;
  vm.getProducts = getProducts;
  vm.getTotalPrice = getTotalPrice;
  vm.getTotalProducts = getTotalProducts;
  vm.addPayment = addPayment;
  vm.applyPayment = applyPayment;

  //FAKE ARRAY
  vm.payments = [];

  vm.totalPrice = 0;

  function init(){
    vm.isLoading = true;
    quotationService.getById($routeParams.id).then(function(res){
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

  function applyTransaction(ev, type) {
    var templateUrl = 'views/checkout/deposit-dialog.html';
    var controller = DepositController;
    var paymentOpts = {
      type:'transaction',
      ammount: 124000,
      verificationCode: '',
      paymentType: 'Deposito/Transaccion'
    };

    if(type == 'terminal'){
      paymentOpts = {
        type:'terminal',
        ammount: 30000,
        verificationCode: '',
        terminal:'TPV Banorte',
        recurringPayments: 3,
        isRecurring: true,
        paymentType: 'Sin intereses'
      };
      templateUrl = 'views/checkout/terminal-dialog.html',
      controller = TerminalController;
    }
    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && vm.customFullscreen;
    $mdDialog.show({
      controller: controller,
      templateUrl: templateUrl,
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: useFullScreen,
      locals: {
        payment: paymentOpts
      }
    })
    .then(function(payment) {
      console.log('Pago aplicado');
      vm.applyPayment(payment);
    }, function() {
      console.log('Pago no aplicado');
    });

  }

  function applyPayment(payment){
    var defaultPayment = {
      ammount: 1200,
      currency: 'MXP',
      type:'deposit',
      isRecurring: false,
      paymentType: 'Efectivo'
    };

    payment = payment || defaultPayment;
    vm.payments.push(payment);

    var params = {
      ammount: 1200,
      currency: 'MXP',
      verificationCode: '8870',
      terminal: 'TPV Banorte'
    }
    vm.addPayment(vm.quotation.id, params).then(function(res){
      console.log(res.data);
    });

  }

  function DepositController($scope, $mdDialog, payment) {
    $scope.payment = payment;

    $scope.hide = function() {
      $mdDialog.hide();
    };
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    $scope.save = function() {
      if($scope.payment.verificationCode && $scope.payment.verificationCode!= ''){
        $mdDialog.hide($scope.payment);
      }else{
        console.log('no cumple');
      }
    };
  }

  function TerminalController($scope, $mdDialog, payment) {
    $scope.payment = payment;

    $scope.hide = function() {
      $mdDialog.hide();
    };
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    $scope.save = function() {
      if($scope.payment.verificationCode && $scope.payment.verificationCode!= ''){
        $mdDialog.hide($scope.payment);
      }else{
        console.log('no cumple');
      }
    };
  }

  function addPayment(orderId,params){
    return quotationService.addPayment(orderId, params);
  }

  function createOrder(params){
    //Formatting order details
    if(params.Details){
      params.Details = params.Details.map(function(detail){
        var obj = {
          Quantity: detail.Quantity,
          Product: detail.Product.id,
          total: (detail.Product.Price * detail.Quantity) || 0
        };
        return obj;
      });
    }
    console.log(params);
    orderService.create(params).then(function(res){
      vm.order = res.data;
      quotationService.update(vm.quotation.id, {Order: vm.order.id}).then(function(res){
        vm.quotation.Order = vm.order;
      });
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
      vm.isLoading = false;
      vm.totalPrice = vm.getTotalPrice();
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
