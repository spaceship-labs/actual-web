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
    $interval,
    api
  ){
  var vm = this;

  angular.extend(vm,{
    api: api,
    applyTransaction: applyTransaction,
    authorizeOrder: authorizeOrder,
    areMethodsDisabled: areMethodsDisabled,
    calculateRemaining: calculateRemaining,
    createOrder: createOrder,
    chooseMethod: chooseMethod,
    getExchangeRate:getExchangeRate,
    getPaidPercentage: getPaidPercentage,
    isActiveGroup: isActiveGroup,
    isActiveMethod: isActiveMethod,
    isMinimumPaid: isMinimumPaid,

    customFullscreen: $mdMedia('xs') || $mdMedia('sm'),
    singlePayment: true,
    multiplePayment: false,
    isLoading: true,
    loadingEstimate: 0,
    payments: [],
    paymentMethodsGroups: [],
    roundCurrency: commonService.roundCurrency
  });

  var EWALLET_TYPE = 'ewallet';
  var CASH_USD_TYPE = 'cash-usd';
  var EWALLET_GROUP_INDEX = 0;

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
        updateEwalletBalance();
        if(vm.quotation.Payments && vm.quotation.Payments.length > 0){
          vm.quotation = setQuotationTotalsByGroup(vm.quotation);
        }        
      })
      .catch(function(err){
        console.log('err', err);
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

  function areMethodsDisabled(methods){
    var disabledCount = 0;
    for(var i=0;i<methods.length > 0;i++){
      if( !isActiveMethod(methods[i]) ){
        disabledCount++;
      }
    }
    return disabledCount === methods.length;
  }

  function isActiveGroup(group){
    var activeKeys = [
      'paymentGroup1',
      'paymentGroup2',
      'paymentGroup3',
      'paymentGroup4',
      'paymentGroup5'
    ];
    var isGroupUsed = false;
    var groupIndex = group.group - 1;
    var groupNumber = group.group;
    var currentGroup = getGroupByQuotation(vm.quotation);
    var areGroupMethodsDisabled = areMethodsDisabled(group.methods);
    if( currentGroup < 0 || currentGroup === 1){
      isGroupUsed = true;
    }else if(currentGroup > 0 && currentGroup === groupNumber){
      isGroupUsed = true;
    }
    return isGroupUsed && !areGroupMethodsDisabled;
  }

  function isActiveMethod(method){
    var remaining = method.total - vm.quotation.ammountPaid;
    var min = method.min || 0;
    return remaining >= min;
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
      var groupIndex = getGroupByQuotation(vm.quotation) - 1;
      group = vm.paymentMethodsGroups[groupIndex];
      firstMethod = group.methods[0];
    }
    setMethod(firstMethod, group);
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
      paymentService.addPayment(vm.quotation.id, payment)
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
        addPayment(payment);
      }, function() {
        console.log('Pago no aplicado');
        clearActiveMethod();
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
      $scope.needsVerification = payment.needsVerification;
      $scope.maxAmmount = (payment.maxAmmount >= 0) ? payment.maxAmmount : false;

      if($scope.payment.currency === 'usd'){
        $scope.payment.ammount = $scope.payment.ammount / $scope.payment.exchangeRate;
        $scope.payment.ammountMXN = $scope.getAmmountMXN($scope.payment.ammount);
      }

      //ROUNDING
      if(payment.type !== EWALLET_TYPE){ 
        $scope.payment.remaining = commonService.roundCurrency($scope.payment.remaining); 
        $scope.payment.ammount = commonService.roundCurrency($scope.payment.ammount);
        $scope.maxAmmount = commonService.roundCurrency($scope.maxAmmount);
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
    $scope.maxAmmount = (payment.maxAmmount >= 0) ? payment.maxAmmount : false;

    //ROUNDING
    $scope.payment.ammount = commonService.roundCurrency($scope.payment.ammount);     
    $scope.payment.remaining = commonService.roundCurrency($scope.payment.remaining); 
    if($scope.maxAmmount){
      $scope.maxAmmount = commonService.roundCurrency($scope.maxAmmount);
    }
    if($scope.payment.min){
      $scope.payment.min = commonService.roundCurrency($scope.payment.min);      
    }

    $scope.numToLetters = function(num){
      return formatService.numberToLetters(num);
    };

    $scope.hide = function() {
      $mdDialog.hide();
    };
    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    $scope.isMinimumValid = function(){
      $scope.payment.min = $scope.payment.min || 0;   
      if($scope.payment.ammount === $scope.payment.remaining){
        $scope.errMsg = '';
        return true;
      }
      else if( ($scope.payment.remaining - $scope.payment.ammount) >= $scope.payment.min && 
        $scope.payment.ammount >= $scope.payment.min
      ){
        $scope.errMsg = '';
        return true;
      }
      
      if($scope.remaining < $scope.payment.min){
        $scope.errMsg = 'El monto mínimo para esta forma de pago es '+$filter('currency')($scope.payment.min)+' pesos.';
      }
      else if($scope.payment.ammount < $scope.payment.min){
        $scope.errMsg = 'El monto mínimo para esta forma de pago es '+$filter('currency')($scope.payment.min)+' pesos.';
      }
      else{
        $scope.errMsg = 'Favor de aplicar el saldo total';
      }
      return false;
    }; 

    $scope.$watch('payment.ammount', function(newVal, oldVal){
      if(newVal !== oldVal){
        $scope.isMinimumValid();
      }
    });

    function isValidVerificationCode(){
      if($scope.payment.type !== 'deposit'){
        return $scope.payment.verificationCode && $scope.payment.verificationCode !== '';
      }
      return true;
    }

    $scope.isvalidPayment = function(){
      $scope.payment.min = $scope.payment.min || 0;
      if($scope.payment.ammount < $scope.payment.min){
        $scope.minStr = $filter('currency')($scope.payment.min);
        $scope.errMsg = 'La cantidad minima es: ' +  $scope.minStr;
      }else{
        $scope.errMin = false;        
      }

      if( $scope.maxAmmount ){
        return (
          $scope.isMinimumValid() &&
          ($scope.payment.ammount <= $scope.maxAmmount) &&
          isValidVerificationCode() &&
          $scope.payment.ammount >= $scope.payment.min
        );
      }
      return (
        $scope.payment.ammount && 
        isValidVerificationCode() &&
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
      var minPaidPercentage = 100;
      if( getPaidPercentage() >= minPaidPercentage ){
        return true;
      }
    }
    return false;
  }

  $scope.$on('$destroy', function(){
    mainDataListener();
  });

}
