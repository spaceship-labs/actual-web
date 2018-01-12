'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:CheckoutOrderCtrl
 * @description
 * # CheckoutOrderCtrl
 * Controller of the dashexampleApp
 */
angular
  .module('dashexampleApp')
  .controller('CheckoutOrderCtrl', CheckoutOrderCtrl);

function CheckoutOrderCtrl(
  api,
  commonService,
  $interval,
  $scope,
  $routeParams,
  $rootScope,
  $location,
  dialogService,
  quotationService,
  orderService,
  deliveryService,
  invoiceService,
  paymentService,
  authService
) {
  var vm = this;
  var EWALLET_POSITIVE = 'positive';
  var EWALLET_NEGATIVE = 'negative';

  angular.extend(vm, {
    toggleRecord: toggleRecord,
    isLoading: false,
    api: api,
    generateInvoice: generateInvoice,
    getPaymentTypeString: paymentService.getPaymentTypeString,
    getSerieByDetailId: getSerieByDetailId,
    showInvoiceErrorIfNeeded: showInvoiceErrorIfNeeded,
    sendInvoice: sendInvoice,
    print: print,
    invoices: [],
    invoicesInterval: false,
    invoiceLoadCounter: 0,
    invoiceLoadLimit: 5,
    invoiceLogInterval: false,
    invoiceLogLoadCounter: 0,
    invoiceLogLoadLimit: 5,
    calculateBalance: orderService.calculateBalance,
    generateSapOrder: generateSapOrder,
    user: $rootScope.user,
    isUserAdmin: authService.isUserAdmin($rootScope.user)
  });

  function showImmediateDeliveryDialog(order) {
    if (order.Details) {
      var hasImmediateDelivery = order.Details.some(function(detail) {
        return detail.immediateDelivery && !detail.isSRService;
      });
      if (hasImmediateDelivery) {
        dialogService.showDialog(
          '!Favor de entregar al cliente los artículos que se llevará¡'
        );
      }
    }
  }

  function init() {
    //vm.isLoading = false;
    vm.isLoading = true;
    vm.isLoadingRecords = true;

    /*
    if($location.search().orderCreated){
      dialogService.showDialog('Pedido creado');
    }
    */

    orderService
      .getById($routeParams.id)
      .then(function(res) {
        vm.order = res.data;
        vm.status = orderService.getOrderStatusLabel(vm.order.status);

        if ($location.search().orderCreated) {
          showImmediateDeliveryDialog(vm.order);
        }

        calculateEwalletAmounts(vm.order);
        loadSapLogs(vm.order.QuotationWeb);

        vm.alegraLogs = [];
        if (vm.order.AlegraLogs) {
          vm.alegraLogs = vm.order.AlegraLogs;
          if (showInvoiceErrorIfNeeded(vm.alegraLogs)) {
            dialogService.showDialog(
              'Hubo un error en la generación de la factura'
            );
          }
        }

        vm.order.Details = vm.order.Details || [];
        vm.order.Address = orderService.formatAddress(vm.order.Address);
        vm.series = groupSeries(vm.order.OrdersSapWeb);
        if (vm.order.status === 'pending-sap') {
          vm.orderSapPending = true;
        }

        vm.isLoading = false;

        quotationService
          .populateDetailsWithProducts(vm.order)
          .then(function(details) {
            vm.order.Details = details;
            vm.order.Details = assignSeriesToDetails(details);
            //vm.order.DetailsGroups = deliveryService.groupDetails(details);
            //vm.order.DetailsGroups = assignSeriesToDetailsGroups(vm.order.DetailsGroups);
            return quotationService.loadProductsFilters(vm.order.Details);
          })
          .then(function(details2) {
            vm.order.Details = details2;
          })
          .catch(function(err) {
            console.log(err);
          });

        vm.invoicesInterval = $interval(function() {
          if (
            vm.invoiceLoadCounter <= vm.invoiceLoadLimit &&
            !vm.invoiceExists
          ) {
            loadInvoices();
            vm.invoiceLoadCounter++;
          }
        }, 3000);

        vm.invoiceLogInterval = $interval(function() {
          if (vm.invoiceLogLoadCounter <= vm.invoiceLogLoadLimit) {
            loadLogsInvoice();
            vm.invoiceLogLoadCounter++;
          }
        }, 3000);
      })
      .catch(function(err) {
        console.log(err);
        var error = err.data || err;
        error = error ? error.toString() : '';
        dialogService.showDialog('Hubo un error: ' + error);
        vm.isLoading = false;
      });

    //loadInvoices();
  }

  function generateSapOrder() {
    if (vm.orderSapPending) {
      vm.isLoading = true;
      $rootScope.scrollTo('main');
      orderService
        .generateOrderSapById(vm.order.id)
        .then(function(res) {
          dialogService.showDialog('Pedido creado en SAP');
          //loadSapDocuments();
          vm.isLoading = false;
          vm.orderSapPending = false;
        })
        .catch(function(err) {
          var error = err.data || err;
          error = error ? error.toString() : '';
          dialogService.showDialog('Hubo un error: ' + error);
          vm.isLoading = false;
        });
    }
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

  function loadInvoices() {
    if (vm.invoices.length === 0) {
      invoiceService.find($routeParams.id).then(function(invoices) {
        vm.invoices = invoices;
        vm.invoiceExists = invoices.length > 0;
        if (vm.invoiceExists && $location.search().orderCreated) {
          dialogService.showDialog('Factura emitida');
        }
      });
    }
  }

  function loadLogsInvoice() {
    if (vm.alegraLogs.length === 0) {
      invoiceService
        .getInvoiceLogs($routeParams.id)
        .then(function(logs) {
          vm.alegraLogs = logs;
          //console.log('vm.invoices', vm.invoices);
          //console.log('logs');
          if (showInvoiceErrorIfNeeded(logs)) {
            dialogService.showDialog(
              'Hubo un error en la generación de la factura'
            );
          }
        })
        .catch(function(err) {
          console.log('err', err);
        });
    }
  }

  function showInvoiceErrorIfNeeded(logs) {
    logs = logs || [];
    var errorExists = _.some(logs, function(log) {
      return log.isError;
    });
    return errorExists && (!vm.invoices || vm.invoices.length === 0);
  }

  function calculateEwalletAmounts(order) {
    vm.ewallet = {
      positive: orderService.getEwalletAmmount(
        order.EwalletRecords,
        EWALLET_POSITIVE
      ),
      negative: orderService.getEwalletAmmount(
        order.EwalletRecords,
        EWALLET_NEGATIVE
      )
    };
    vm.ewallet.before =
      order.Client.ewallet + vm.ewallet.negative - vm.ewallet.positive;
    vm.ewallet.current = order.Client.ewallet;
  }

  function assignSeriesToDetails(details) {
    var mappedDetails = details.map(function(detail) {
      var hasSeries = false;
      var productSerie = getSerieByDetailId(detail.id);
      if (productSerie) {
        detail.productSerie = productSerie;
        hasSeries = true;
      }
      detail.hasSeries = hasSeries;
      return detail;
    });
    return mappedDetails;
  }

  //TODO: Check if ventas.miactual.com has the name function name
  function assignSeriesToDetailsGroups(deliveryGroups) {
    var mappedDeliveryGroups = deliveryGroups.map(function(group) {
      var hasSeries = false;
      group.details = group.details.map(function(detail) {
        var productSerie = getSerieByDetailId(detail.id);
        if (productSerie) {
          detail.productSerie = productSerie;
          hasSeries = true;
        }
        return detail;
      });
      group.hasSeries = hasSeries;
      return group;
    });
    return mappedDeliveryGroups;
  }

  function groupSeries(ordersSap) {
    var series = ordersSap.reduce(function(acum, orderSap) {
      if (orderSap.ProductSeries) {
        acum = acum.concat(orderSap.ProductSeries);
      }
      return acum;
    }, []);

    return series;
  }

  function getSerieByDetailId(detailId) {
    var series = vm.series || [];
    return _.findWhere(series, { OrderDetail: detailId });
  }

  function toggleRecord(record) {
    vm.records.forEach(function(rec) {
      if (rec.id !== record.id) {
        rec.isActive = false;
      }
    });
    record.isActive = !record.isActive;
  }

  function print() {
    window.print();
  }

  function generateInvoice() {
    vm.isLoading = true;
    invoiceService
      .create($routeParams.id)
      .then(function(res) {
        var invoice = res.data;

        vm.invoices.push(invoice);
        vm.isLoading = false;
        vm.invoiceExists = true;
        dialogService.showDialog('Factura creada exitosamente');
        console.log('factura created response', res);
      })
      .catch(function(err) {
        vm.isLoading = false;
        console.log('err', err);
        var error = err.data.message;
        dialogService.showDialog('Error al crear factura: ' + error);
      });
  }

  function sendInvoice() {
    vm.isLoading = true;
    invoiceService
      .send($routeParams.id)
      .then(function(res) {
        vm.isLoading = false;
        dialogService.showDialog('Factura enviada exitosamente');
        console.log('factura sent response', res);
      })
      .catch(function(err) {
        vm.isLoading = false;
        var error = err.data;
        dialogService.showDialog(error);
      });
  }

  $scope.$on('$destroy', function() {
    if (vm.invoicesInterval) {
      $interval.cancel(vm.invoicesInterval);
    }
    if (vm.invoiceLogInterval) {
      $interval.cancel(vm.invoiceLogInterval);
    }
  });

  init();
}
