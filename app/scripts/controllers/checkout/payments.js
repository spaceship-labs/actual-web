'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:CheckoutPaymentsCtrl
 * @description
 * # CheckoutPaymentsCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('CheckoutPaymentsCtrl', CheckoutPaymentsCtrl);

function CheckoutPaymentsCtrl(
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
    siteService,
    authService,
    clientService,
    paymentService,
    localStorageService,
    ewalletService,
    checkoutService,
    $interval,
    api
  ){
  var vm = this;

  angular.extend(vm,{
    api: api,
    applyTransaction: applyTransaction,
    authorizeOrder: authorizeOrder,
    areMethodsDisabled: checkoutService.areMethodsDisabled,
    cancelPayment     : cancelPayment,
    calculateRemaining: calculateRemaining,
    createOrder: createOrder,
    chooseMethod: chooseMethod,
    getPaidPercentage: checkoutService.getPaidPercentage,
    isActiveGroup: checkoutService.isActivePaymentGroup,
    isActiveMethod: checkoutService.isActiveMethod,
    isMinimumPaid: checkoutService.isMinimumPaid,
    intervalProgress: false,
    customFullscreen: $mdMedia('xs') || $mdMedia('sm'),
    singlePayment: true,
    multiplePayment: false,
    isLoading: true,
    loadingEstimate: 0,
    payments: [],
    paymentMethodsGroups: [],
    roundCurrency: commonService.roundCurrency
  });

  var EWALLET_TYPE = ewalletService.ewalletType;

  if($rootScope.isMainDataLoaded){
    init();
  }else{
    var mainDataListener = $rootScope.$on('mainDataLoaded',function(e,data){
      init();
    });
  }

  function init(){
    animateProgress();
    vm.isLoading = true;

    quotationService.getById($routeParams.id).then(function(res){
        vm.quotation = res.data;
        return quotationService.validateQuotationStockById(vm.quotation.id); 
      })
      .then(function(isValidStock){
        if( !isValidStock){
          $location.path('/quotations/edit/' + vm.quotation.id)
            .search({stockAlert:true});
        }

        if(vm.quotation.Order){
          $location.path('/checkout/order/' + vm.quotation.Order.id);
        }
        vm.quotation.ammountPaid = vm.quotation.ammountPaid || 0;
        loadPaymentMethods();

        pmPeriodService.getActive().then(function(res){
          vm.validMethods = res.data;
        });
        vm.isLoading = false;
    });
  }

  function loadPaymentMethods(){
    quotationService.getPaymentOptions(vm.quotation.id)
      .then(function(response){
        var groups = response.data || [];
        vm.paymentMethodsGroups = groups;
        //ewalletService.updateQuotationEwalletBalance(vm.quotation, vm.paymentMethodsGroups);
        if(vm.quotation.Payments && vm.quotation.Payments.length > 0){
          vm.quotation = setQuotationTotalsByGroup(vm.quotation);
        }        
      })
      .catch(function(err){
        console.log('err', err);
      });
          
  }


  function setMethod(method, group){
    method.storeType = $rootScope.activeStore.group;
    var options = paymentService.getPaymentOptionsByMethod(method);
    method.options = options;
    method.group = angular.copy(group);
    vm.quotation.total = angular.copy(method.total);
    vm.quotation.subtotal = angular.copy(method.subtotal);
    vm.quotation.discount = angular.copy(method.discount);
    return method;
  }

  function chooseMethod(method, group){
    vm.activeMethod = setMethod(method, group);
    var remaining = vm.quotation.total - vm.quotation.ammountPaid;
    vm.activeMethod.remaining = remaining;
    vm.activeMethod.maxAmmount = remaining;
    if(method.type === EWALLET_TYPE){
      var balance = vm.quotation.Client.ewallet || 0;
      vm.activeMethod.maxAmmount = balance;
      if(balance <= remaining){
        remaining = balance;
      }
    }
    if(vm.activeMethod.maxAmmount <= 0){
      dialogService.showDialog('Fondos insuficientes');
      return false;
    }
    return vm.applyTransaction(null, vm.activeMethod, remaining);
  }

  function clearActiveMethod(){
    vm.activeMethod = null;
    var firstMethod = false;
    var group = false;

    if(!vm.quotation.Payments || vm.quotation.Payments.length === 0){
      group = vm.paymentMethodsGroups[0];
      firstMethod = group.methods[0];
    }else{
      var groupIndex = checkoutService.getGroupByQuotation(vm.quotation) - 1;
      group = vm.paymentMethodsGroups[groupIndex];
      firstMethod = group.methods[0];
    }
    setMethod(firstMethod, group);
  }

  function setQuotationTotalsByGroup(quotation){
    var paymentGroup = checkoutService.getGroupByQuotation(quotation);
    var currentGroup = _.findWhere(vm.paymentMethodsGroups, {group: paymentGroup});
    var firstMethod = currentGroup.methods[0];
    quotation.paymentGroup = paymentGroup;
    quotation.total = angular.copy(firstMethod.total);
    quotation.subtotal = angular.copy(firstMethod.subtotal);
    quotation.discount = angular.copy(firstMethod.discount);
    return quotation;
  }

  function updateVMQuoatation(newQuotation){
    vm.quotation.ammountPaid = newQuotation.ammountPaid;
    vm.quotation.paymentGroup = newQuotation.paymentGroup;
    vm.quotation = setQuotationTotalsByGroup(vm.quotation);            
    delete vm.activeMethod;
  }

  function cancelPayment(payment){
    confirmPaymentCancel(payment)
      .then(function(){
        vm.isLoading = true;
        vm.isLoadingPayments = true;
        
        return paymentService.cancelPayment(vm.quotation.id, payment.id);
      })
      .then(function(res){
        if(res.data){
          var quotation = res.data;
          vm.quotation.Payments = quotation.Payments;

          updateVMQuoatation(quotation);

          vm.isLoadingPayments = false;
          vm.isLoading = false;

          delete vm.activeMethod;        
        }
      })
      .catch(function(err){
        console.log(err);
        vm.isLoadingPayments = false;
        vm.isLoading = false;
        if(err && err.data){
          dialogService.showDialog('Error: <br/>' + err.data);
        }
      });      
  }

  function addPayment(payment){
    if(
        ( (payment.ammount > 0) && (vm.quotation.ammountPaid < vm.quotation.total) )
        || payment.ammount < 0
      ){
      vm.isLoadingPayments = true;
      vm.isLoading = true;
      paymentService.addPayment(vm.quotation.id, payment)
        .then(function(res){
          if(res.data){
            var quotation = res.data;
            vm.quotation.Payments.push(payment);

            updateVMQuoatation(quotation)

            vm.isLoadingPayments = false;
            vm.isLoading = false;

            delete vm.activeMethod;

            if(vm.quotation.ammountPaid >= vm.quotation.total){
              createOrder();
              //dialogService.showDialog('Cantidad total pagada');
            }else{
              dialogService.showDialog('Pago aplicado');
            }
          }else{
            dialogService.showDialog('Hubo un error');
          }
          return;
        })
        .then(function(){
          if(payment.type === EWALLET_TYPE){
            ewalletService.updateQuotationEwalletBalance(vm.quotation, vm.paymentMethodsGroups);
          }
        })
        .catch(function(err){
          console.log(err);
          vm.isLoadingPayments = false;
          vm.isLoading = false;
          dialogService.showDialog('Error: <br/>' + err.data);
        });
    }else{
      createOrder();
      //dialogService.showDialog('Cantidad total pagada');
    }
  }

  function applyTransaction(ev, method, ammount) {
    if(method){
      var templateUrl = 'views/checkout/payment-dialog.html';
      var controller  = DepositController;
      method.currency = method.currency || 'MXP';
      method.ammount  = ammount;
      var paymentOpts = angular.copy(method);
      if(method.msi || method.terminals){
        controller    = TerminalController;
      }
      paymentOpts.ammount = ammount;
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && vm.customFullscreen;
      $mdDialog.show({
        controller: [
          '$scope', 
          '$mdDialog', 
          'formatService',
          'commonService', 
          'ewalletService',
          'payment', 
          controller
        ],
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
        addPayment(payment);
      }, function() {
        console.log('Pago no aplicado');
        clearActiveMethod();
      });
    }else{
      commonService.showDialog('Revisa los datos, e intenta de nuevo');
    }
  }

  function PaymentDialogController($scope, $mdDialog, formatService, commonService, payment) {
    success = function(token){
      return console.log(token);
    };
    error = function(err){
      return console.log(error.message);
    };
    $scope.paymentConekta = function(form){
        console.log('Hola');
        if (form.$valid) {
          Conekta.Token.create(form, success, error);
          return false;
        }else{
          console.log('Hubo un error')
        }

    };
  }


  function calculateRemaining(ammount){
    return ammount - vm.quotation.ammountPaid;
  }

  function authManager(manager){
    vm.isLoading = true;
    authService.authManager(manager)
      .then(function(res){
        var manager = res.data;
        if(!manager.id){
          return $q.reject('Error en la autorización');
        }
        var params = {
          Manager: manager.id,
          minPaidPercentage: 60,
        };
        return quotationService.update(vm.quotation.id, params);
      })
      .then(function(quotationUpdated){
        vm.isLoading = false;
      })
      .catch(function(err){
        vm.isLoading = false;
        console.log(err);
        dialogService.showDialog('Error en la autorización');
      });
  }

  function authorizeOrder(ev, method, ammount) {
    if( checkoutService.getPaidPercentage(vm.quotation) >= 60 ){
      var controller  = AuthorizeOrderController;
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && vm.customFullscreen;
      $mdDialog.show({
        controller: ['$scope', '$mdDialog', controller],
        templateUrl: 'views/checkout/authorize-dialog.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        fullscreen: useFullScreen,
      })
      .then(function(manager) {
        authManager(manager);
      }, function() {
        console.log('No autorizado');
      });
    }else{
      commonService.showDialog('La suma pagada debe ser mayor o igual al 60% del total de la orden');
    }
  }

  function createOrder(form){
    if( checkoutService.isMinimumPaid(vm.quotation) ){
      confirmOrder()
        .then(function(){
          vm.isLoadingProgress = true;
          vm.loadingEstimate = 0;
          var params = {
            paymentGroup: vm.quotation.paymentGroup || 1
          };
          animateProgress();
          return orderService.createFromQuotation(vm.quotation.id, params);
        })
        .then(function(res){
          vm.isLoadingProgress = false;
          vm.order = res.data;
          if(vm.order.id){
            quotationService.removeCurrentQuotation();
            $location.path('/checkout/order/' + vm.order.id);
          }
        }).catch(function(err){
          console.log('err', err);
          var errMsg = '';
          if(err){
            errMsg = err.data || '';            
            dialogService.showDialog('Hubo un error, revisa los datos e intenta de nuevo <br/>' + errMsg);
          }
          vm.isLoadingProgress = false;
        });
    }
  }

  function animateProgress(){
    vm.intervalProgress = $interval(function(){
      vm.loadingEstimate += 5;
      if(vm.loadingEstimate >= 100){
        vm.loadingEstimate = 0;
      }
    },1000);
  }

  function confirmPaymentCancel(payment){
    var amount = $filter('currency')(payment.ammount);
    var currency = 'MXN';
    if(payment.currency === 'usd'){
      currency = 'USD';
    }
    var dialogMsg = '¿Desea cancelar este pago por: ';
    dialogMsg += amount + currency;
    dialogMsg += '?';
    var confirm = $mdDialog.confirm()
          .title('CANCELAR PAGO')
          .textContent(dialogMsg)
          .ariaLabel('Cancelar pago')
          .targetEvent(null)
          .ok('Cancelar')
          .cancel('Regresar');
    return $mdDialog.show(confirm);
  }

  function confirmOrder(){
    var paidPercentage = checkoutService.getPaidPercentage(vm.quotation);
    var paidPercentStr = $filter('number')(paidPercentage,2);
    var dialogMsg = 'El pedido ha sido pagado al ' + paidPercentStr + '%';
    dialogMsg += ' ( '+ $filter('currency')(vm.quotation.ammountPaid) +' de ';
    dialogMsg += ' '+ $filter('currency')(vm.quotation.total) +' )';
    var confirm = $mdDialog.confirm()
          .title('CREAR PEDIDO')
          .textContent(dialogMsg)
          .ariaLabel('Crear pedido')
          .targetEvent(null)
          .ok('Crear')
          .cancel('Regresar');
    return $mdDialog.show(confirm);
  }


  $scope.$on('$destroy', function(){
    mainDataListener();
    if(vm.intervalProgress){
      $interval.cancel(vm.intervalProgress);
    }
  });

}
