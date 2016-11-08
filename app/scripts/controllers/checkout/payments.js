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
    $interval
  ){
  var vm = this;

  angular.extend(vm,{
    addPayment: addPayment,
    applyTransaction: applyTransaction,
    authorizeOrder: authorizeOrder,
    calculateRemaining: calculateRemaining,
    createOrder: createOrder,
    clearActiveMethod: clearActiveMethod,
    chooseMethod: chooseMethod,
    getExchangeRate:getExchangeRate,
    getPaidPercentage: getPaidPercentage,
    isActiveGroup: isActiveGroup,
    isMinimumPaid: isMinimumPaid,
    selectMultiple: selectMultiple,
    selectSingle: selectSingle,
    setMethod: setMethod,

    customFullscreen: $mdMedia('xs') || $mdMedia('sm'),
    singlePayment: true,
    multiplePayment: false,
    loadingEstimate: 0,
    payments: [],
    paymentMethodsGroups: [],
    roundCurrency: commonService.roundCurrency
  });

  var EWALLET_TYPE = 'ewallet';
  var CASH_USD_TYPE = 'cash-usd';
  var EWALLET_GROUP_INDEX = 0;

  function init(){
    animateProgress();
    vm.isLoading = true;

    quotationService.getById($routeParams.id).then(function(res){
        vm.quotation = res.data;
        return quotationService.getCurrentStock(vm.quotation.id); 
      })
      .then(function(response){
  
        var quotationDetailsStock = response.data;
        if( !quotationService.isValidStock(quotationDetailsStock) ){
          $location.path('/quotations/edit/' + vm.quotation.id)
            .search({stockAlert:true});
        }

        if(vm.quotation.Order){
          $location.path('/checkout/order/' + vm.quotation.Order.id);
        }
        vm.quotation.ammountPaid = vm.quotation.ammountPaid || 0;

        if($rootScope.activeStore){
          loadPaymentMethods();
        }else{
          $rootScope.$on('activeStoreAssigned',function(e,data){
            loadPaymentMethods();
          });
        }

        pmPeriodService.getActive().then(function(res){
          vm.validMethods = res.data;
        });
        vm.isLoading = false;
    });
  }

  function loadPaymentMethods(){
    getPaymentMethodsGroups(vm.quotation.id).then(function(groups){
      vm.paymentMethodsGroups = groups;
      if(vm.quotation.Payments && vm.quotation.Payments.length > 0){
        vm.quotation = setQuotationTotalsByGroup(vm.quotation);
      }
    });          
  }

  function updateEwalletBalance(){
    var group = vm.paymentMethodsGroups[EWALLET_GROUP_INDEX];
    var ewalletPaymentMethod = _.findWhere(group.methods, {type:EWALLET_TYPE});
    var ewalletPayments = _.where(vm.quotation.Payments, {type:EWALLET_TYPE});
    clientService.getEwalletById(vm.quotation.Client.id)
      .then(function(res){
        var balance = res.data || 0;
        var description = getEwalletDescription(balance);;
        ewalletPaymentMethod.description = description;
        ewalletPayments = ewalletPayments.map(function(payment){
          payment.description = description;
          return payment;
        });
      })
      .catch(function(err){
        console.log(err);
      });
  }

  function getEwalletDescription(balance){
    var description = '';
    var balanceRounded = commonService.roundCurrency( balance, {up:false} );
    var balanceStr = $filter('currency')(balanceRounded);
    description = 'Saldo disponible: ' + balanceStr +' MXN';    
    return description;
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

  function getPaymentMethodsGroups(quotationId){
    var deferred = $q.defer();
    var methodsGroups = paymentService.getPaymentMethodsGroups();
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
        var totalsByGroup = responsePromises || [];
        totalsByGroup = totalsByGroup.map(function(tbg){
          return tbg.data || {};
        });
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
            if(m.type === CASH_USD_TYPE){
              var exrStr = $filter('currency')(exchangeRate);
              m.description = 'Tipo de cambio '+exrStr+' MXN';
            }
            else if(m.type === EWALLET_TYPE){
              var balance = vm.quotation.Client.ewallet || 0;
              m.description = getEwalletDescription(balance);
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
      var currentGroup = getGroupByQuotation(vm.quotation);
      if( currentGroup < 0 || currentGroup === 1){
        isGroupUsed = true;
      }else if(currentGroup > 0 && currentGroup === index+1){
        isGroupUsed = true;
      }
      return vm.validMethods[activeKeys[index]] && isGroupUsed;
    }else{
      return false;
    }
  }

  function getGroupByQuotation(quotation){
    var group = -1;
    if(quotation.Payments.length > 0){
      group = quotation.paymentGroup;
      var paymentsCount = quotation.Payments.length;
      group = quotation.Payments[paymentsCount - 1].group;
    }
    return group;
  }

  function selectMultiple(){
    vm.multiplePayment = true;
    vm.singlePayment = false;
  }

  function setMethod(method, group){
    vm.activeMethod = method;
    method.storeType = $rootScope.activeStore.group;
    var options = paymentService.getPaymentOptionsByMethod(method);
    method.options = options;
    vm.activeMethod.group = angular.copy(group);
    vm.quotation.total = angular.copy(vm.activeMethod.total);
    vm.quotation.subtotal = angular.copy(vm.activeMethod.subtotal);
    vm.quotation.discount = angular.copy(vm.activeMethod.discount);
  }

  function chooseMethod(method, group){
    vm.setMethod(method, group);
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

    if(!vm.quotation.Payments || vm.quotation.Payments.length == 0){
      group = vm.paymentMethodsGroups[0];
      firstMethod = group.methods[0];
    }else{
      var groupIndex = getGroupByQuotation(vm.quotation) - 1;
      group = vm.paymentMethodsGroups[groupIndex];
      firstMethod = group.methods[0];
    }
    vm.setMethod(firstMethod, group);
  }

  function setQuotationTotalsByGroup(quotation){
    var paymentGroup = getGroupByQuotation(quotation);
    var currentGroup = _.findWhere(vm.paymentMethodsGroups, {group: paymentGroup});
    var firstMethod = currentGroup.methods[0];
    quotation.paymentGroup = paymentGroup;
    quotation.total = angular.copy(firstMethod.total);
    quotation.subtotal = angular.copy(firstMethod.subtotal);
    quotation.discount = angular.copy(firstMethod.discount);
    return quotation;
  }

  function addPayment(payment){
    if(
        ( (payment.ammount > 0) && (vm.quotation.ammountPaid < vm.quotation.total) )
        || payment.ammount < 0
      ){
      vm.isLoadingPayments = true;
      vm.isLoading = true;
      quotationService.addPayment(vm.quotation.id, payment)
        .then(function(res){
          if(res.data){
            var quotation = res.data;
            vm.quotation.ammountPaid = quotation.ammountPaid;
            vm.quotation.paymentGroup = quotation.paymentGroup;
            vm.quotation.Payments.push(payment);
            vm.quotation = setQuotationTotalsByGroup(vm.quotation);            
            vm.isLoadingPayments = false;
            vm.isLoading = false;

            delete vm.activeMethod;

            if(vm.quotation.ammountPaid >= vm.quotation.total){
              dialogService.showDialog('Cantidad total pagada');
            }else{
              dialogService.showDialog('Pago aplicado');
            }
          }else{
            dialogService.showDialog('Hubo un error');
          }
          return;
        })
        .then(function(){
          if(payment.type == EWALLET_TYPE){
            updateEwalletBalance();
          }
        })
        .catch(function(err){
          console.log(err);
          vm.isLoadingPayments = false;
          vm.isLoading = false;
          dialogService.showDialog('Error: <br/>' + err.data);
        });
    }else{
      dialogService.showDialog('Cantidad total pagada');
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
        controller: ['$scope', '$mdDialog', 'formatService','commonService', 'payment', controller],
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
    //if( method && ammount && !isNaN(ammount) ){
    if( getPaidPercentage() >= 60 ){
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


  function DepositController($scope, $mdDialog, formatService, commonService, payment) {

    $scope.init = function(){
      $scope.payment = payment;
      if(payment.type !== EWALLET_TYPE){ 
        $scope.payment.ammount = commonService.roundCurrency($scope.payment.ammount);
      }
      $scope.needsVerification = payment.needsVerification;
      $scope.maxAmmount = (payment.maxAmmount >= 0) ? payment.maxAmmount : false;

      if($scope.payment.currency === 'usd'){
        $scope.payment.ammount = $scope.payment.ammount / $scope.payment.exchangeRate;
        $scope.payment.ammountMXN = $scope.getAmmountMXN($scope.payment.ammount);
      }
    };

    $scope.getAmmountMXN = function(ammount){
      return ammount * $scope.payment.exchangeRate;
    };

    $scope.isvalidPayment = function(){
      if($scope.maxAmmount){
        return ($scope.payment.ammount <= $scope.maxAmmount);
      }
      return true;
    };

    $scope.hide = function() {
      $mdDialog.hide();
    };
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    $scope.save = function() {
      if( $scope.isvalidPayment() ){
        $mdDialog.hide($scope.payment);
      }else{
        dialogService.showDialog('No hay fondos suficientes');
      }
    };

    $scope.init();
  }

  function TerminalController($scope, $mdDialog, formatService, commonService, payment) {
    $scope.payment = payment;
    $scope.needsVerification = payment.needsVerification;
    //$scope.payment.ammount = commonService.roundCurrency($scope.payment.ammount); 
    console.log('$scope.payment.ammount', $scope.payment.ammount);
    
    $scope.maxAmmount = (payment.maxAmmount >= 0) ? payment.maxAmmount : false;

    $scope.numToLetters = function(num){
      return formatService.numberToLetters(num);
    };

    $scope.hide = function() {
      $mdDialog.hide();
    };
    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    function isPaymentMinValid(){
      $scope.payment.min = $scope.payment.min || 0;   
      if($scope.payment.ammount === $scope.payment.remaining){
        return true;
      }
      else if( ($scope.payment.remaining - $scope.payment.ammount) >= $scope.payment.min ){
        return true;
      }
      $scope.errMsg = 'La cantidad restante es menor al monto minimo';
      return false;
    } 

    $scope.isvalidPayment = function(){
      console.log('scope payment in isValidStock', $scope.payment.ammount);
      $scope.payment.min = $scope.payment.min || 0;
      if($scope.payment.ammount < $scope.payment.min){
        $scope.minStr = $filter('currency')($scope.payment.min);
        $scope.errMsg = 'La cantidad minima es: ' +  $scope.minStr;
      }else{
        $scope.errMin = false;        
      }

      if( $scope.maxAmmount ){
        return (
          isPaymentMinValid() &&
          ($scope.payment.ammount <= $scope.maxAmmount) &&
          $scope.payment.ammount && 
          $scope.payment.verificationCode &&
          $scope.payment.verificationCode != '' &&
          $scope.payment.ammount >= $scope.payment.min
        );
      }
      return (
        $scope.payment.ammount && 
        $scope.payment.verificationCode &&
        $scope.payment.verificationCode != '' &&
        $scope.payment.ammount >= $scope.payment.min        
      );
    };

    $scope.onChangeCard = function(card){
      $scope.terminal = getSelectedTerminal(card);
    };

    function getSelectedTerminal(card){
      var option = _.find($scope.payment.options, function(option){
        return option.card.value === card;
      });
      if(option){
        return option.terminal;
      }
      return false;
    }

    $scope.save = function() {
      if( $scope.isvalidPayment() ){
        if($scope.payment.options.length > 0){
          $scope.terminal = getSelectedTerminal($scope.payment.card);
          $scope.payment.terminal = $scope.terminal.value;
        }        
        //alert('cumple');
        $mdDialog.hide($scope.payment);
      }else{
        console.log('no cumple');
      }
    };
  }

  function AuthorizeOrderController($scope, $mdDialog){
    $scope.manager = {};
    $scope.hide = function() {
      $mdDialog.hide();
    };
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    $scope.authorize = function(form) {
      if(form.$valid){
        $mdDialog.hide($scope.manager);
      }
    };
  }


  function createOrder(form){
    if( isMinimumPaid() ){
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
        .catch(function(err){
          console.log(err);
          dialogService.showDialog('Hubo un error, revisa tus datos <br/>' + err.data);
          return $q.reject('cancelled-by-user');
        })
        .then(function(res){
          vm.isLoadingProgress = false;
          vm.order = res.data;
          if(vm.order.id){
            quotationService.setActiveQuotation(false);
            $location.path('/checkout/order/' + vm.order.id);
          }
        }).catch(function(err){
          if(err !== 'cancelled-by-user'){
            commonService.showDialog('Hubo un error, revisa los datos e intenta de nuevo');
            vm.isLoadingProgress = false;
            console.log(err);
          }
        });
    }
  }

  function animateProgress(){
    $interval(function(){
      vm.loadingEstimate += 5;
      if(vm.loadingEstimate >= 100){
        vm.loadingEstimate = 0;
      }
    },1000);
  }

  function confirmOrder(){
    var paidPercent = $filter('number')(getPaidPercentage(),2);
    var dialogMsg = 'El pedido ha sido pagado al ' + paidPercent + '%';
    dialogMsg += ' ( '+ $filter('currency')(vm.quotation.ammountPaid) +' de ';
    dialogMsg += ' '+ $filter('currency')(vm.quotation.total) +' )';
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog.confirm()
          .title('CREAR PEDIDO')
          .textContent(dialogMsg)
          .ariaLabel('Crear pedido')
          .targetEvent(null)
          .ok('Crear')
          .cancel('Regresar');
    return $mdDialog.show(confirm);
  }

  function getPaidPercentage(){
    var percentage = 0;
    if(vm.quotation){
      percentage = vm.quotation.ammountPaid / (vm.quotation.total / 100);
    }
    return percentage;
  }


  function isMinimumPaid(){
    if(vm.quotation){
      var minPaidPercentage = vm.quotation.minPaidPercentage || 100;
      if( getPaidPercentage() >= minPaidPercentage ){
        return true;
      }
    }
    return false;
  }

  init();


}
