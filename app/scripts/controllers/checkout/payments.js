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
    areMethodsDisabled: checkoutService.areMethodsDisabled,
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
    sapLogs: [],
    paymentMethodsGroups: [],
    CLIENT_BALANCE_TYPE: paymentService.clientBalanceType,
    roundCurrency: commonService.roundCurrency
  });

  var EWALLET_TYPE = ewalletService.ewalletType;
  var CLIENT_BALANCE_TYPE = paymentService.clientBalanceType;
  var mainDataListener = function(){};

  if($rootScope.isMainDataLoaded){
    init();
  }else{
    mainDataListener = $rootScope.$on('mainDataLoaded',function(e,data){
      init();
    });
  }

  function init(){
    animateProgress();
    vm.isLoading = true;

    var getParams = {
      payments:true,
    };

    quotationService.getById($routeParams.id, getParams)
      .then(function(res){
        vm.quotation = res.data;
        loadSapLogs(vm.quotation.id);
        loadPayments();

        return $q.all([
          quotationService.validateQuotationStockById(vm.quotation.id),
          loadPaymentMethods()
        ]);
      })
      .then(function(result){
        var isValidStock = result[0]; 

        if( !isValidStock){
          $location.path('/quotations/edit/' + vm.quotation.id)
            .search({stockAlert:true});
        }

        if(!vm.quotation.Details || vm.quotation.Details.length === 0){
          $location.path('/quotations/edit/' + vm.quotation.id);
        }        

        if(!validateQuotationAddress(vm.quotation)){
          //$location.path('/quotations/edit/' + vm.quotation.id);
        }

        if(vm.quotation.Order){
          $location.path('/checkout/order/' + vm.quotation.Order.id);
        }
        vm.quotation.ammountPaid = vm.quotation.ammountPaid || 0;

        vm.isLoading = false;
      })
      .catch(function(err){
        console.log('err', err);
        dialogService.showDialog('Error: \n' + err.data);
      });

  }

  function loadSapLogs(quotationId){
    vm.isLoadingSapLogs = true;
    quotationService.getSapOrderConnectionLogs(quotationId)
      .then(function(res){
        vm.sapLogs = res.data;
        console.log('sapLogs', vm.sapLogs);
        vm.isLoadingSapLogs = false;
      })
      .catch(function(err){
        console.log('err', err);
        vm.isLoadingSapLogs = false;        
      });
  }

  function validateQuotationAddress(quotation){
    if(quotation.Address){
      return true;
    }
    return false;
  }

  function loadPaymentMethods(){
    var deferred = $q.defer();

    var params = {
      financingTotals: true
    };
    quotationService.getPaymentOptions(vm.quotation.id, params)
      .then(function(response){
        var groups = response.data || [];
        vm.paymentMethodsGroups = groups;
        
        //ewalletService.updateQuotationEwalletBalance(vm.quotation, vm.paymentMethodsGroups);
      
        if(vm.quotation.Payments && vm.quotation.Payments.length > 0){
          vm.quotation = setQuotationTotalsByGroup(vm.quotation);
        }
        deferred.resolve();        
      })
      .catch(function(err){
        console.log('err', err);
        deferred.reject(err);
      });

    return deferred.promise;    
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
    
    if(method.type === EWALLET_TYPE || method.type === CLIENT_BALANCE_TYPE){
      var balance = paymentService.getMethodAvailableBalance(method, vm.quotation);
      console.log('balance', balance);
      vm.activeMethod.maxAmmount = balance;
      if(balance <= remaining){
        remaining = balance;
      }
    }
    
    if(vm.activeMethod.maxAmmount < 0.01){
      dialogService.showDialog('Fondos insuficientes');
      return false;
    }

    if(vm.quotation.Client){
      if(vm.activeMethod.currency === 'usd' && vm.quotation.Client.Currency === 'MXP'){
        dialogService.showDialog('Pagos en dolares no disponibles para este cliente por configuración en SAP');
        return false;      
      }
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
    //vm.quotation.Client = newQuotation.Client || vm.quotation.Client;            
    vm.quotation = setQuotationTotalsByGroup(vm.quotation);
    delete vm.activeMethod;
  }

  function tokenizePaymentCard(payment){
    var deferred = $q.defer();

    var onSuccess = function(token){
      console.log('token', token);
      deferred.resolve(token.id);
    };

    var onError = function(err){
      console.log('err', err);
      deferred.reject(err);
    };

    console.log('payment', payment);
    var tokenParams = {
      card:{
        name: payment.cardName,
        number: _.clone(payment.cardObject.number),
        exp_month: _.clone(payment.cardObject.expMonth),
        exp_year: _.clone(payment.cardObject.expYear),
        cvc: _.clone(payment.cardObject.cvc)
      },
      address:{
        country: payment.cardCountry,
        state: payment.cardState,
        zipcode: payment.cardZip,
        city: payment.cardCity,
        street1: payment.cardAddress1,
        street2: payment.cardAddress1
      }
    };

    delete payment.cardObject;
    console.log('tokenParams', tokenParams);

    Conekta.Token.create(tokenParams, onSuccess, onError);

    return deferred.promise;    
  }

  function addPayment(payment){
    if(
        ( (payment.ammount > 0) && (vm.quotation.ammountPaid < vm.quotation.total) )
        || payment.ammount < 0
      ){
      vm.isLoadingProgress = true;
      //vm.isLoading = true;
      
      tokenizePaymentCard(payment)
        .then(function(token){
          delete payment.cardObject;
          payment.cardToken = token;
          console.log('token in tokenize', token);
        /*  
          return paymentService.addPayment(vm.quotation.id, payment);
        })
        .then(function(){
        */
          return createOrder(payment);
        })
        .catch(function(err){
          vm.isLoadingProgress = false;
          console.log('err', err);
          var errMsg = err.message_to_purchaser || err;
          dialogService.showDialog(errMsg);
        })

    }
  }

  function loadPayments(){
    quotationService.getPayments(vm.quotation.id)
      .then(function(res){
        var payments = res.data;
        vm.quotation.Payments = payments;
        vm.isLoadingPayments = false;
      })
      .catch(function(err){
        console.log('err', err);
        dialogService.showDialog('Hubo un error, recarga la página');
        vm.isLoadingPayments = false;
      });
  }
  

  function applyTransaction(ev, method, ammount) {
    if(method){
      var templateUrl = 'views/checkout/payment-dialog.html';
      var controller  = TerminalController;
      method.currency = method.currency || 'MXP';
      method.ammount  = ammount;
      var paymentOpts = angular.copy(method);
      paymentOpts.ammount = ammount;
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && vm.customFullscreen;
      $mdDialog.show({
        controller: [
          '$scope', 
          '$mdDialog',
          '$filter', 
          'formatService',
          'commonService', 
          'ewalletService',
          'dialogService',
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

  function calculateRemaining(ammount){
    return ammount - vm.quotation.ammountPaid;
  }

  function createOrder(payment){
    console.log('llego a createorder');
    if(!vm.quotation.Details || vm.quotation.Details.length === 0){
      dialogService.showDialog('No hay artículos en esta cotización');
      return;
    }
    
    vm.isLoadingProgress = true;
    vm.loadingEstimate = 0;
    var params = {
      paymentGroup: vm.quotation.paymentGroup || 1,
      payment: payment
    };
    animateProgress();
    console.log('params', params);
    orderService.createFromQuotation(vm.quotation.id, params)
      .then(function(res){
        vm.isLoadingProgress = false;
        vm.order = res.data;
        if(vm.order.id){
          quotationService.removeCurrentQuotation();
          $location.path('/checkout/order/' + vm.order.id)
            .search({orderCreated:true});
        }
      }).catch(function(err){
        console.log('err', err);
        var errMsg = '';
        if(err){
          errMsg = err.data || err;
          errMsg = errMsg ? errMsg.toString() : '';
          dialogService.showDialog('Hubo un error, revisa los datos e intenta de nuevo \n' + errMsg);
        }
        loadSapLogs(vm.quotation.id);
        vm.isLoadingProgress = false;
      });
  }

  function animateProgress(){
    vm.intervalProgress = $interval(function(){
      vm.loadingEstimate += 5;
      if(vm.loadingEstimate >= 100){
        vm.loadingEstimate = 0;
      }
    },1000);
  }

  $scope.$on('$destroy', function(){
    mainDataListener();
    if(vm.intervalProgress){
      $interval.cancel(vm.intervalProgress);
    }
  });

}