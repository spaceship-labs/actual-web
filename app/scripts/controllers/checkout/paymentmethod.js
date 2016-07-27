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

function CheckoutPaymentmethodCtrl($routeParams, $rootScope, $scope, $mdMedia, $mdDialog ,quotationService, productService, orderService, pmPeriodService, commonService, formatService){
  var vm = this;

  angular.extend(vm,{
    addPayment: addPayment,
    applyTransaction: applyTransaction,
    applyCashPayment: applyCashPayment,
    createOrder: createOrder,
    getTotalByPaymentMethod: getTotalByPaymentMethod,
    getGroupByPayments: getGroupByPayments,
    getMethods: getMethods,
    init: init,
    isActiveGroup: isActiveGroup,
    selectMultiple: selectMultiple,
    selectSingle: selectSingle,
    setMethod: setMethod,

    customFullscreen: $mdMedia('xs') || $mdMedia('sm'),
    singlePayment: true,
    multiplePayment: false,
    payments: [],
    totalPrice: 0,
    paymentMethods: []
  });

  function init(){
    vm.isLoading = true;
    quotationService.getById($routeParams.id).then(function(res){
      vm.quotation = res.data;
      quotationService.getQuotationProducts(vm.quotation).then(function(details){
        vm.quotation.Details = details;
        vm.totalPrice = quotationService.calculateTotal(vm.quotation);
        vm.subTotal = quotationService.calculateSubTotal(vm.quotation);
        vm.totalProducts = quotationService.calculateItemsNumber(vm.quotation);
        vm.totalDiscount = quotationService.calculateTotalDiscount(vm.quotation);
        vm.paymentMethods = vm.getMethods();
        vm.isLoading = false;
      });
      pmPeriodService.getActive().then(function(res){
        vm.validPayments = res.data;
      });
    });
  }

  function getMethods(){
    var methodsGroups = commonService.getPaymentMethods();
    var discountKeys = ['discountPg1','discountPg2','discountPg3','discountPg4','discountPg5'];
    methodsGroups.map(function(mG){
      mG.methods = mG.methods.map(function(m){
        var discountKey = discountKeys[mG.group - 1]
        var totalByMethod = quotationService.getTotalByPaymentMethod(vm.quotation, discountKey);
        m.totalDiscount = vm.quotation.total - totalByMethod;
        return m;
      });
    })
    return methodsGroups;
  }

  function selectSingle(){
    vm.singlePayment = true;
    vm.multiplePayment = false;
  }

  function isActiveGroup(index){
    var activeKeys = ['paymentGroup1','paymentGroup2','paymentGroup3','paymentGroup4','paymentGroup5'];
    if(vm.validPayments){
      var isGroupUsed = false;
      var currentGroup = vm.getGroupByPayments();
      if( currentGroup < 0){
        isGroupUsed = true;
      }else if(currentGroup > 0 && currentGroup == index+1){
        isGroupUsed = true;
      }
      return vm.validPayments[activeKeys[index]] && isGroupUsed;
    }else{
      return false;
    }
  }

  function getGroupByPayments(){
    var group = -1;
    vm.quotation.Payments.forEach(function(payment){
      group = payment.group;
    });
    return group;
  }

  function selectMultiple(){
    vm.multiplePayment = true;
    vm.singlePayment = false;
  }

  function setMethod(method, group){
    vm.activeMethod = method;
    vm.activeMethod.group = group;
  }

  function addPayment(payment){
    quotationService.addPayment(vm.quotation.id, payment).then(function(res){
      if(res.data && res.data.length > 0){
        var quotation = res.data[0];
        vm.quotation.ammountPaid = quotation.ammountPaid;
        console.log(vm.quotation);
      }
      console.log(payment);
      vm.quotation.Payments.push(payment);
      vm.isLoadingPayments = false;
      delete vm.activeMethod.ammount;
      delete vm.activeMethod.verficiationCode;
      console.log(vm.activeMethod);
    });
  }

  function applyCashPayment(method, ammount){
    var params = {
      currency: method.currency || 'MXP',
      ammount: ammount
    };
    params = angular.extend(params, method);
    vm.isLoadingPayments = true;
    vm.addPayment(params);
  }

  function applyTransaction(ev, method, ammount) {
    var templateUrl = 'views/checkout/deposit-dialog.html';
    var controller = DepositController;
    method.currency = method.currency || 'MXP';
    method.ammount = ammount;
    var paymentOpts = angular.copy(method);

    if(method.msi || method.terminals){
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
      vm.isLoadingPayments = true;
      vm.addPayment(payment);
    }, function() {
      console.log('Pago no aplicado');
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

  function TerminalController($scope, $mdDialog, formatService, payment) {
    $scope.payment = payment;

    $scope.numToLetters = function(num){
      return formatService.numberToLetters(num);
    }

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


  function createOrder(form){
    if(vm.quotation.ammountPaid >= vm.quotation.total){
      vm.isLoading = true;
      orderService.createFromQuotation(vm.quotation.id).then(function(res){
        vm.isLoading = false;
        console.log(res);
      }).catch(function(err){
        console.log(err);
      });
    }
  }

  //paymentDiscountKey eg: discountPg2
  function getTotalByPaymentMethod(paymentDiscountKey){
    if(vm.quotation){
      return quotationService.getTotalByPaymentMethod(vm.quotation, paymentDiscountKey);
    }else{
      return 0;
    }
  }

  vm.init();


}
