'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:CheckoutOrderCtrl
 * @description
 * # CheckoutOrderCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('CheckoutOrderCtrl', CheckoutOrderCtrl);

function CheckoutOrderCtrl(
  api,
  commonService ,
  $routeParams,
  $rootScope,
  $location,
  dialogService,
  quotationService,
  orderService,
  deliveryService,
  invoiceService
){
  var vm = this;
  var EWALLET_POSITIVE = 'positive';
  var EWALLET_NEGATIVE = 'negative';


  angular.extend(vm, {
    calculateBalance: calculateBalance,
    print: print,
    getPaymentType: getPaymentType,
    formatAddress: formatAddress,
    toggleRecord: toggleRecord,
    isLoading: false,
    api: api,
    generateInvoice: generateInvoice,
    sendInvoice: sendInvoice,
  });

  function init(){
    //vm.isLoading = false;
    vm.isLoading = true;
    vm.isLoadingRecords = true;
    orderService.getById($routeParams.id).then(function(res){
      vm.order = res.data;
      vm.order.Details = vm.order.Details || [];
      vm.order.Address = vm.formatAddress(vm.order.Address);

      vm.ewallet = {
        positive: getEwalletAmmount(vm.order.EwalletRecords, EWALLET_POSITIVE),
        negative: getEwalletAmmount(vm.order.EwalletRecords,EWALLET_NEGATIVE),
      };
      vm.ewallet.before = vm.order.Client.ewallet + vm.ewallet.negative - vm.ewallet.positive;
      vm.ewallet.current = vm.order.Client.ewallet;

      vm.isLoading = false;
      quotationService.populateDetailsWithProducts(vm.order)
        .then(function(details){
          vm.order.Details = details;
          vm.order.DetailsGroups = deliveryService.groupDetails(details);
          return quotationService.loadProductFilters(vm.order.Details);
        })
        .then(function(details2){
          vm.order.Details = details2;
        })
        .catch(function(err){
          console.log(err);
        });

      quotationService.getRecords(vm.order.Quotation)
        .then(function(result){
          console.log(result);
          vm.records = result.data;
          vm.isLoadingRecords = false;
        })
        .catch(function(err){
          console.log(err);
        });
    })
    .catch(function(err){
      console.log(err);
      vm.isLoading = false;
    });

    invoiceService.find($routeParams.id).then(function(invoices){
      vm.invoiceExists = invoices.length > 0;
    });

  }

  function calculateBalance(paid, total){
    //var paidRounded = commonService.roundCurrency(paid);
    //var totalRounded = commonService.roundCurrency(total);
    return (paid - total);
    //return (paidRounded - totalRounded);
  }

  function getEwalletAmmount(ewalletRecords, type){
    ewalletRecords = ewalletRecords || [];
    ewalletRecords = ewalletRecords.filter(function(record){
      return record.type === type;
    });
    var amount = ewalletRecords.reduce(function(acum, record){
      acum += record.amount;
      return acum;
    },0);
    return amount;
  }

  function toggleRecord(record){
    vm.records.forEach(function(rec){
      if(rec.id != record.id){
        rec.isActive = false;
      }
    });
    record.isActive = !record.isActive;
  }

  function formatAddress(address){
    address.name = (address.FirstName&&address.LastName) ? address.FirstName+' '+address.LastName : address.Name;
    address.address = address.Address;
    address.phone = address.phone || address.Tel1;
    address.mobile = address.mobilePhone || address.Cellolar;
    return address;
  }

  function getPaymentType(payment){
    var type = '1 sola exhibición';
    if(payment.type === 'cash' || payment.type === 'cash-usd'){
      type = 'Pago de contado';
    }else if(payment.msi){
      type = payment.msi + ' meses sin intereses';
    }else if(payment.type === 'transfer'){
      type = 'Transferencia';
    }else if(payment.type === 'deposit'){
      type = 'Deposito';
    }else if(payment.type === 'ewallet'){
      type = 'Monedero electrónico';
    }
    return type;
  }

  function print(){
    window.print();
  }

  function generateInvoice() {
    vm.isLoading = true;
    invoiceService
      .create($routeParams.id)
      .then(function(res) {
        vm.isLoading = false;
        vm.invoiceExists = true;
        dialogService.showDialog('Factura creada exitosamente');
        console.log('factura created response', res);
      })
      .catch(function(err) {
        vm.isLoading = false;
        var error = err.data.message;
        dialogService.showDialog(error);
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
        var error = err.data.message;
        dialogService.showDialog(error);
      });
  }

  init();
}
