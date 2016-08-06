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

function CheckoutPaymentmethodCtrl(
    $routeParams,
    $rootScope,
    $scope,
    $q,
    $mdMedia,
    $mdDialog,
    $location,
    $filter,
    commonService,
    dialogService,
    formatService,
    orderService,
    pmPeriodService,
    productService,
    quotationService,
    siteService
  ){
  var vm = this;

  angular.extend(vm,{
    addPayment: addPayment,
    applyTransaction: applyTransaction,
    createOrder: createOrder,
    clearActiveMethod: clearActiveMethod,
    chooseMethod: chooseMethod,
    getGroupByPayments: getGroupByPayments,
    getPaymentMethods: getPaymentMethods,
    getExchangeRate:getExchangeRate,
    init: init,
    isActiveGroup: isActiveGroup,
    selectMultiple: selectMultiple,
    selectSingle: selectSingle,
    setMethod: setMethod,

    customFullscreen: $mdMedia('xs') || $mdMedia('sm'),
    singlePayment: true,
    multiplePayment: false,
    payments: [],
    paymentMethods: [],
    math: window.Math
  });

  function init(){
    vm.isLoading = true;
    quotationService.getById($routeParams.id).then(function(res){
      vm.quotation = res.data;

      if(vm.quotation.Order){
        $location.path('/checkout/order/' + vm.quotation.Order);
      }

      vm.quotation.ammountPaid = vm.quotation.ammountPaid || 0;
      vm.getPaymentMethods(vm.quotation.id).then(function(methods){
        vm.paymentMethods = methods;
        if(vm.quotation.Payments && vm.quotation.Payments.length > 0){
          var paymentGroup = vm.getGroupByPayments();
          var currentGroup = _.findWhere(vm.paymentMethods, {group: paymentGroup});
          var currentMethod = currentGroup.methods[0];
          vm.setMethod(currentMethod, paymentGroup);
        }
      });
      pmPeriodService.getActive().then(function(res){
        vm.validMethods = res.data;
      });
      vm.isLoading = false;
    });
  }

  function getExchangeRate(){
    var deferred = $q.defer();
    siteService.findByHandle('actual-group').then(function(res){
      var site = res.data || {};
      deferred.resolve(site.exchangeRate);
    }).catch(function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  }


  function getPaymentMethods(quotationId){
    var deferred = $q.defer();
    var methodsGroups = commonService.getPaymentMethods();
    var discountKeys = ['discountPg1','discountPg2','discountPg3','discountPg4','discountPg5'];
    var totalsPromises = [];
    var exchangeRate = 18.76;

    methodsGroups.forEach(function(mG){
      totalsPromises.push(quotationService.getQuotationTotals(quotationId, {paymentGroup:mG.group}));
    });

    return vm.getExchangeRate()
      .then(function(exr){
        exchangeRate = exr;
        return $q.all(totalsPromises)
      })
      .then(function(responsePromises){
        console.log(exchangeRate);
        var totalsByGroup = responsePromises || [];
        totalsByGroup = totalsByGroup.map(function(tbg){
          return tbg.data || {};
        });
        console.log(totalsByGroup);
        methodsGroups = methodsGroups.map(function(mG, index){
          mG.total = totalsByGroup[index].total || 0;
          mG.subtotal = totalsByGroup[index].subtotal || 0;
          mG.discount = totalsByGroup[index].discount || 0;
          mG.methods = mG.methods.map(function(m){
            var discountKey = discountKeys[mG.group - 1]
            m.discountKey = discountKey;
            m.total = mG.total;
            m.subtotal = mG.subtotal;
            m.discount = mG.discount;
            m.exchangeRate = exchangeRate;
            if(m.type === 'cash-usd'){
              var exrStr = $filter('currency')(exchangeRate);
              m.description = 'Tipo de cambio '+exrStr+' MXN';
            }
            return m;
          });
          return mG;
        });
        return methodsGroups;
      })
      .catch(function(err){
        console.log(err);
        return err;
      });
  }

  function selectSingle(){
    vm.singlePayment = true;
    vm.multiplePayment = false;
  }

  function isActiveGroup(index){
    var activeKeys = ['paymentGroup1','paymentGroup2','paymentGroup3','paymentGroup4','paymentGroup5'];
    if(vm.validMethods){
      var isGroupUsed = false;
      var currentGroup = vm.getGroupByPayments();
      if( currentGroup < 0){
        isGroupUsed = true;
      }else if(currentGroup > 0 && currentGroup == index+1){
        isGroupUsed = true;
      }
      return vm.validMethods[activeKeys[index]] && isGroupUsed;
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
    vm.quotation.total = vm.activeMethod.total;
    vm.quotation.subtotal = vm.activeMethod.subtotal;
    vm.quotation.discount = vm.activeMethod.discount;
  }

  function chooseMethod(method, group){
    vm.setMethod(method, group);
    var remaining = vm.quotation.total - vm.quotation.ammountPaid;
    vm.applyTransaction(null, vm.activeMethod, remaining);
  }

  function clearActiveMethod(){
    vm.activeMethod = null;
    var firstMethod = false;
    var group = false;

    if(!vm.quotation.Payments || vm.quotation.Payments.length == 0){
      group = vm.paymentMethods[0];
      firstMethod = group.methods[0];
      console.log(firstMethod);
    }else{
      var groupIndex = vm.getGroupByPayments() - 1;
      group = vm.paymentMethods[groupIndex];
      firstMethod = group.methods[0];
    }
    vm.setMethod(firstMethod, group);
  }

  function addPayment(payment){
    if( (payment.ammount > 0 && vm.quotation.ammountPaid < vm.quotation.total)
        || payment.ammount < 0 ){
      vm.isLoadingPayments = true;
      quotationService.addPayment(vm.quotation.id, payment)
        .then(function(res){
          if(res.data){
            var quotation = res.data;
            vm.quotation.ammountPaid = quotation.ammountPaid;
            if(vm.quotation.ammountPaid >= vm.quotation.total){
              dialogService.showDialog('Cantidad total pagada');
            }else{
              dialogService.showDialog('Pago aplicado');
            }
          }
          vm.quotation.Payments.push(payment);
          vm.isLoadingPayments = false;
          delete vm.activeMethod.ammount;
          delete vm.activeMethod.verficiationCode;
        })
        .catch(function(err){
          console.log(err);
          vm.isLoadingPayments = false;
          dialogService.showDialog(err.data.message);
        });
    }else{
      dialogService.showDialog('Cantidad total pagada');
    }
  }

  function applyTransaction(ev, method, ammount) {
    //if( method && ammount && !isNaN(ammount) ){
    if(method){
      var templateUrl = 'views/checkout/terminal-dialog.html';
      var controller  = DepositController;
      method.currency = method.currency || 'MXP';
      method.ammount  = Math.ceil(ammount);
      var paymentOpts = angular.copy(method);
      if(method.msi || method.terminals){
        controller    = TerminalController;
      }
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && vm.customFullscreen;
      $mdDialog.show({
        controller: ['$scope', '$mdDialog', 'formatService', 'payment', controller],
        templateUrl: templateUrl,
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        fullscreen: useFullScreen,
        locals: {
          payment: paymentOpts
        }
      })
      .then(function(payment) {
        console.log('Pago aplicado');
        vm.addPayment(payment);
      }, function() {
        console.log('Pago no aplicado');
        vm.clearActiveMethod();
      });
    }else{
      commonService.showDialog('Revisa los datos, e intenta de nuevo');
    }
  }


  function DepositController($scope, $mdDialog, formatService, payment) {
    $scope.payment = payment;
    $scope.needsVerification = payment.needsVerification;

    $scope.hide = function() {
      $mdDialog.hide();
    };
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    $scope.save = function() {
      $mdDialog.hide($scope.payment);
    };
  }

  function TerminalController($scope, $mdDialog, formatService, payment) {
    $scope.payment = payment;
    $scope.needsVerification = payment.needsVerification;

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
      var params = {
        paymentGroup: vm.activeMethod.group || 1
      };
      orderService.createFromQuotation(vm.quotation.id, params).then(function(res){
        vm.isLoading = false;
        vm.order = res.data;
        if(vm.order.id){
          quotationService.setActiveQuotation(false);
          $location.path('/checkout/order/' + vm.order.id);
        }
      }).catch(function(err){
        commonService.showDialog('Hubo un error, revisa los datos e intenta de nuevo');
        console.log(err);
      });
    }
  }

  vm.init();


}
