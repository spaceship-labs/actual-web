'use strict';
angular
  .module('actualWebApp')
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
  $timeout,
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
  api,
  gtmService
) {
  var vm = this;

  angular.extend(vm, {
    api: api,
    openTransactionDialog: openTransactionDialog,
    areMethodsDisabled: checkoutService.areMethodsDisabled,
    calculateRemaining: calculateRemaining,
    createOrder: createOrder,
    chooseMethod: chooseMethod,
    getPaidPercentage: checkoutService.getPaidPercentage,
    isActiveGroup: checkoutService.isActivePaymentGroup,
    isActiveMethod: checkoutService.isActiveMethod,
    isMinimumPaid: checkoutService.isMinimumPaid,
    intervalProgress: $mdMedia('xs') || $mdMedia('sm'),
    singlePayment: true,
    multiplePayment: false,
    isLoading: true,
    loadingEstimate: 0,
    payments: [],
    sapLogs: [],
    paymentMethodsGroups: [],
    CLIENT_BALANCE_TYPE: paymentService.clientBalanceType,
    roundCurrency: commonService.roundCurrency,
    showCardsDialog: showCardsDialog,
    showTransferInstructionDialog: showTransferInstructionDialog
  });

  var EWALLET_TYPE = ewalletService.ewalletType;
  var CLIENT_BALANCE_TYPE = paymentService.clientBalanceType;
  var mainDataListener = function() {};
  var selectedMethod;

  if ($rootScope.isMainDataLoaded) {
    init();
  } else {
    mainDataListener = $rootScope.$on('mainDataLoaded', function(e, data) {
      init();
    });
  }

  function init() {
    animateProgress();
    vm.isLoading = true;

    var getParams = {
      payments: true,
      address: true
    };

    quotationService
      .getById($routeParams.id, getParams)
      .then(function(res) {
        vm.quotation = res.data;

        if (vm.quotation && vm.quotation.OrderWeb) {
          if (vm.quotation.OrderWeb) {
            vm.hasAnSpeiOrder = true;
          }
        }

        loadSapLogs(vm.quotation.id);
        loadPayments();

        return $q.all([
          quotationService.validateQuotationStockById(vm.quotation.id),
          loadPaymentMethods()
        ]);
      })
      .then(function(result) {
        var isValidStock = result[0];

        if (!isValidStock) {
          $location
            .path('/quotations/edit/' + vm.quotation.id)
            .search({ stockAlert: true });
        }

        if (!vm.quotation.Details || vm.quotation.Details.length === 0) {
          $location.path('/quotations/edit/' + vm.quotation.id);
        }

        if (!validateQuotationAddress(vm.quotation)) {
          $location.path('/quotations/edit/' + vm.quotation.id);
        }

        if (vm.quotation.rateLimitReported) {
          //$location.path('/quotations/edit/' + vm.quotation.id);
        }

        if (vm.quotation.Order) {
          $location.path(
            '/checkout/order/' + vm.quotation.Order.id + '/COMPRA-CONFIRMADA'
          );
        }
        vm.quotation.ammountPaid = vm.quotation.ammountPaid || 0;

        vm.isLoading = false;
      })
      .catch(function(err) {
        console.log('err', err);
        dialogService.showDialog(err.data);
        $location.path('/quotations/edit/' + vm.quotation.id);
      });
  }

  function loadSapLogs(quotationId) {
    vm.isLoadingSapLogs = true;
    quotationService
      .getSapOrderConnectionLogs(quotationId)
      .then(function(res) {
        vm.sapLogs = res.data;
        console.log('sapLogs', vm.sapLogs);
        vm.isLoadingSapLogs = false;
      })
      .catch(function(err) {
        console.log('err', err);
        vm.isLoadingSapLogs = false;
      });
  }

  function validateQuotationAddress(quotation) {
    console.log('quotation.Address.U_CP', quotation.Address.U_CP);
    console.log('quotation.ZipcodeDelivery.cp', quotation.ZipcodeDelivery.cp);
    if (
      quotation.Address &&
      quotation.Address.U_CP === quotation.ZipcodeDelivery.cp
    ) {
      return true;
    }
    return false;
  }

  function loadPaymentMethods() {
    var deferred = $q.defer();

    var params = {
      financingTotals: true
    };
    quotationService
      .getPaymentOptions(vm.quotation.id, params)
      .then(function(response) {
        var groups = response.data || [];
        vm.paymentMethodsGroups = groups;

        //ewalletService.updateQuotationEwalletBalance(vm.quotation, vm.paymentMethodsGroups);

        if (vm.quotation.Payments && vm.quotation.Payments.length > 0) {
          vm.quotation = setQuotationTotalsByGroup(vm.quotation);
        }
        deferred.resolve();
      })
      .catch(function(err) {
        console.log('err', err);
        deferred.reject(err);
      });

    return deferred.promise;
  }

  function setMethod(method, group) {
    method.storeType = $rootScope.activeStore.group;
    var options = paymentService.getPaymentOptionsByMethod(method);
    method.options = options;
    method.group = angular.copy(group);
    vm.quotation.total = angular.copy(method.total);
    vm.quotation.subtotal = angular.copy(method.subtotal);
    vm.quotation.discount = angular.copy(method.discount);
    return method;
  }

  function chooseMethod(method, group) {
    vm.activeMethod = setMethod(method, group);
    var remaining = vm.quotation.total - vm.quotation.ammountPaid;
    vm.activeMethod.remaining = remaining;
    vm.activeMethod.maxAmmount = remaining;

    if (method.type === EWALLET_TYPE || method.type === CLIENT_BALANCE_TYPE) {
      var balance = paymentService.getMethodAvailableBalance(
        method,
        vm.quotation
      );
      console.log('balance', balance);
      vm.activeMethod.maxAmmount = balance;
      if (balance <= remaining) {
        remaining = balance;
      }
    }

    if (vm.activeMethod.maxAmmount < 0.01) {
      dialogService.showDialog('Fondos insuficientes');
      return false;
    }

    if (vm.quotation.Client) {
      if (
        vm.activeMethod.currency === 'usd' &&
        vm.quotation.Client.Currency === 'MXP'
      ) {
        dialogService.showDialog(
          'Pagos en dolares no disponibles para este cliente por configuración en SAP'
        );
        return false;
      }
    }
    console.log('paso 1');

    return openTransactionDialog(vm.activeMethod, remaining);
  }

  function clearActiveMethod() {
    vm.activeMethod = null;
    var firstMethod = false;
    var group = false;

    if (!vm.quotation.Payments || vm.quotation.Payments.length === 0) {
      group = vm.paymentMethodsGroups[0];
      firstMethod = group.methods[0];
    } else {
      var groupIndex = checkoutService.getGroupByQuotation(vm.quotation) - 1;
      group = vm.paymentMethodsGroups[groupIndex];
      firstMethod = group.methods[0];
    }
    setMethod(firstMethod, group);
  }

  function setQuotationTotalsByGroup(quotation) {
    var paymentGroup = checkoutService.getGroupByQuotation(quotation);
    var currentGroup = _.findWhere(vm.paymentMethodsGroups, {
      group: paymentGroup
    });
    var firstMethod = currentGroup.methods[0];
    quotation.paymentGroup = paymentGroup;
    quotation.total = angular.copy(firstMethod.total);
    quotation.subtotal = angular.copy(firstMethod.subtotal);
    quotation.discount = angular.copy(firstMethod.discount);
    return quotation;
  }

  function updateVMQuoatation(newQuotation) {
    vm.quotation.ammountPaid = newQuotation.ammountPaid;
    vm.quotation.paymentGroup = newQuotation.paymentGroup;
    //vm.quotation.Client = newQuotation.Client || vm.quotation.Client;
    vm.quotation = setQuotationTotalsByGroup(vm.quotation);
    delete vm.activeMethod;
  }

  function getBin(payment) {
    var ccNumber = payment.cardObject.number;
    var valur = ccNumber.replace(/[ .-]/g, '').slice(0, 6);
    return valur;
  }

  function setPaymentMethodInfo(status, response) {
    console.log('status', status);
    if (status == 200) {
      var paymentMethod = {
        name: 'paymentMethodId',
        type: 'hidden',
        value: response[0].id
      };
      return paymentMethod;
    } else throw new TypeError('method error');
  }

  function sdkResponseHandler(status, response) {
    console.log('sdkResponseHandler', response);
    if (status != 200 && status != 201) {
      throw new TypeError('Error token MP');
    } else {
      var card = {
        name: 'token',
        type: 'hidden',
        value: response.id
      };
      return card;
    }
  }

  function tokenMP(payment) {
    var deferred = $q.defer();
    Mercadopago.setPublishableKey('TEST-a4165fe4-a739-49bd-b815-cf7f17a6db72');

    var bin = getBin(payment);
    var methodInfo;
    Mercadopago.getPaymentMethod(
      {
        bin: bin
      },
      function setPaymentMethodInfo(status, response) {
        console.log('status', status);

        if (status == 200) {
          methodInfo = {
            name: 'paymentMethodId',
            type: 'hidden',
            value: response[0].id
          };
          console.log('methodInfo', methodInfo);
        } else deferred.reject(err);
      }
    );

    var paramsData = {
      paymentMethodId: methodInfo,
      cardNumber: payment.cardObject.number,
      securityCode: payment.cardObject.cvc,
      cardExpirationMonth: payment.cardObject.expMonth,
      cardExpirationYear: payment.cardObject.expYear,
      cardholderName: payment.cardName,
      installments: 1
    };
    console.log('params token', paramsData);
    var token;
    Mercadopago.createToken(paramsData, function sdkResponseHandler(
      status,
      response
    ) {
      console.log('sdkResponseHandler', response);
      console.log('status ', status);
      if (status != 200 && status != 201) {
        deferred.reject(err);
      } else {
        token = {
          name: 'token',
          type: 'hidden',
          value: response.id
        };
        console.log('token', token);
        deferred.resolve(token, methodInfo);
      }
    });

    return deferred.promise;
  }

  function tokenizePaymentCard(payment) {
    var deferred = $q.defer();

    if (payment.type === 'transfer') {
      deferred.resolve(false);
      return deferred.promise;
    }

    var onSuccess = function(token) {
      console.log('token', token);
      deferred.resolve(token.id);
    };

    var onError = function(err) {
      console.log('err', err);
      deferred.reject(err);
    };

    console.log('tokenParams', tokenParams);

    var tokenParams = {
      card: {
        name: payment.cardName,
        number: _.clone(payment.cardObject.number),
        exp_month: _.clone(payment.cardObject.expMonth),
        exp_year: _.clone(payment.cardObject.expYear),
        cvc: _.clone(payment.cardObject.cvc)
      },
      address: {
        country: payment.cardCountry,
        state: payment.cardState,
        zipcode: payment.cardZip,
        city: payment.cardCity,
        street1: payment.cardAddress1,
        street2: payment.cardAddress1
      }
    };

    //delete payment.cardObject;
    console.log('tokenParams', tokenParams);
    Conekta.Token.create(tokenParams, onSuccess, onError);

    return deferred.promise;
  }

  function addPayment(payment) {
    if (
      (payment.ammount > 0 && vm.quotation.ammountPaid < vm.quotation.total) ||
      payment.ammount < 0
    ) {
      $rootScope.scrollTo('main');
      vm.isLoadingProgress = true;
      var cardObjectAux = _.clone(payment.cardObject);
      console.log('payment', payment);

      tokenMP(payment)
        .then(function(token, methodInfo) {
          console.log('token api', token);
          console.log('method api', methodInfo);
          delete payment.cardObject;
          payment.cardToken = token;
          payment.cardMethod = methodInfo;
          //console.log("payment after tonekinze", payment);
          //console.log('token in tokenize', token);
          return createOrder(payment);
        })
        .then(function(res) {
          vm.isLoadingProgress = false;
          vm.order = res.data;
          if (vm.order.id) {
            $rootScope.scrollTo('main');
            quotationService.removeCurrentQuotation();

            gtmService.notifyOrder({
              folio: vm.order.folio,
              total: vm.order.total,
              client: vm.order.CardCode,
              zipcode: vm.order.U_CP
            });
            //FOR SPEI PAYMENTS
            if (vm.order.isSpeiOrder) {
              vm.hasAnSpeiOrder = true;
              vm.quotation.OrderWeb = vm.order;
              //dialogService.showDialog('Pedido pendiente de pago via SPEI, procesando');
              $location.path('/quotations/edit/' + vm.quotation.id);
              return;
            }

            $location
              .path('/checkout/order/' + vm.order.id + '/COMPRA-CONFIRMADA')
              .search({ orderCreated: true });
          }
        })
        .catch(function(err) {
          console.log('err', err);
          var errMsg = '';
          if (err) {
            errMsg = err.data || err;

            if (errMsg.message_to_purchaser) {
              errMsg = errMsg.message_to_purchaser;
            }
            errMsg = errMsg ? errMsg.toString() : '';

            if (err.data) {
              if (err.data.conektaLimitErrorThrown) {
                $rootScope.scrollTo('main');
                quotationService.removeCurrentQuotation();
                $location.path('/quotations/edit/' + vm.quotation.id);
                return;
              }

              var paymentAttempts = getQuotationPaymentAttemptsByError(err);
              vm.quotation.paymentAttempts = paymentAttempts;
              if (paymentAttempts >= quotationService.PAYMENT_ATTEMPTS_LIMIT) {
                $rootScope.scrollTo('main');
                $location.path('/quotations/edit/' + vm.quotation.id);
                return;
              }
            }

            var conektaOrderMsg = getMessageFromConektaOrderError(err);
            if (conektaOrderMsg) {
              errMsg = conektaOrderMsg;
            }

            var callback = function() {
              payment.cardObject = cardObjectAux;
              console.log('paso 2');

              console.log('payment to openTransactionDialog again', payment);
              openTransactionDialog(
                selectedMethod,
                vm.quotation.total,
                payment
              );
            };

            dialogService.showDialog(
              'Hubo un error, revisa los datos e intenta de nuevo \n' + errMsg,
              callback
            );
          }
          loadSapLogs(vm.quotation.id);
          vm.isLoadingProgress = false;
        });
    }
  }

  function getQuotationPaymentAttemptsByError(err) {
    var errObj = _.clone(err);
    var paymentAttempts = vm.quotation.paymentAttempts;
    errObj = errObj || {};
    if (errObj.data) {
      if (errObj.data.type === 'processing_error') {
        paymentAttempts = paymentAttempts + 1;
      }
    }

    return paymentAttempts;
  }

  function getMessageFromConektaOrderError(err) {
    var msg = false;
    if (err.data) {
      if (err.data.details && err.data.details.length > 0) {
        msg = (err.data.details[0] || {}).message;
      }
    }
    return msg;
  }

  function loadPayments() {
    quotationService
      .getPayments(vm.quotation.id)
      .then(function(res) {
        var payments = res.data;
        vm.quotation.Payments = payments;
        vm.isLoadingPayments = false;
      })
      .catch(function(err) {
        console.log('err', err);
        dialogService.showDialog('Hubo un error, recarga la página');
        vm.isLoadingPayments = false;
      });
  }

  function openTransactionDialog(method, ammount, paymentDefaults) {
    var ev = null;
    selectedMethod = method;
    if (method) {
      var templateUrl = 'views/checkout/payment-dialog.html';
      var controller = PaymentDialogController;
      method.currency = method.currency || 'MXP';
      method.ammount = ammount;
      var paymentOpts = angular.copy(method);
      paymentOpts.ammount = ammount;

      if (paymentDefaults) {
        console.log('paymentOpts before', paymentOpts);
        console.log('paymentDefaults', paymentDefaults);
        if (paymentDefaults.cardObject) {
          console.log('extending');
          paymentOpts.cardObject = paymentDefaults.cardObject;
          console.log('paymmentops extended', paymentOpts);
        }
        paymentOpts = _.extend(paymentOpts, paymentDefaults);
        console.log('paymentOpts after', paymentOpts);
      }

      var useFullScreen = $mdMedia('sm') || $mdMedia('xs');
      $mdDialog
        .show({
          controller: [
            '$scope',
            '$mdDialog',
            '$filter',
            '$timeout',
            'formatService',
            'commonService',
            'ewalletService',
            'dialogService',
            'payment',
            'quotation',
            controller
          ],
          templateUrl: templateUrl,
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          fullscreen: useFullScreen,
          locals: {
            payment: paymentOpts,
            quotation: vm.quotation
          }
        })
        .then(function(payment) {
          console.log('Pago aplicado');
          addPayment(payment);
        })
        .catch(function(err) {
          console.log('Pago no aplicado');
          clearActiveMethod();
          throw new TypeError('Pago no aplicado');
        });
      /*
      , function() {
        console.log('Pago no aplicado');
        clearActiveMethod();
      });
      */
    } else {
      commonService.showDialog('Revisa los datos, e intenta de nuevo');
    }
  }

  function calculateRemaining(ammount) {
    return ammount - vm.quotation.ammountPaid;
  }

  function createOrder(payment) {
    //Removing listener
    mainDataListener();

    if (!vm.quotation.Details || vm.quotation.Details.length === 0) {
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
    return orderService.createFromQuotation(vm.quotation.id, params);
  }

  function animateProgress() {
    vm.intervalProgress = $interval(function() {
      vm.loadingEstimate += 5;
      if (vm.loadingEstimate >= 100) {
        vm.loadingEstimate = 0;
      }
    }, 1000);
  }

  function showCardsDialog(method) {
    var cards = method.cards || [];
    var msg = 'Bancos participantes: ' + cards.join(', ');
    dialogService.showDialog(msg);
  }

  function showTransferInstructionDialog(ev) {
    var controller = TransferInstructionsDialogController;
    var useFullScreen = $mdMedia('sm') || $mdMedia('xs');
    return $mdDialog.show({
      controller: ['$scope', '$mdDialog', controller],
      templateUrl: 'views/checkout/transfer-instructions-dialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      fullscreen: useFullScreen
    });
  }

  $scope.$on('$destroy', function() {
    mainDataListener();
    $mdDialog.cancel();
    if (vm.intervalProgress) {
      $interval.cancel(vm.intervalProgress);
    }
  });
}
