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

function CheckoutOrderCtrl(api, commonService ,$routeParams, $rootScope, $location, quotationService, orderService){
  var vm = this;
  var EWALLET_POSITIVE = 'positive';
  var EWALLET_NEGATIVE = 'negative';


  angular.extend(vm,{
    init: init,
    print: print,
    getPaymentType: getPaymentType,
    formatAddress: formatAddress,
    toggleRecord: toggleRecord,
    isLoading: false,
    api: api
  });

  function init(){
    //vm.isLoading = false;
    vm.isLoading = true;
    vm.isLoadingRecords = true;
    vm.placeholderDate = moment( new Date() ).add('days',5).toDate();

    orderService.getById($routeParams.id).then(function(res){
      vm.order = res.data;
      console.log(vm.order);
      vm.order.Details = vm.order.Details || [];
      vm.order.Address = vm.formatAddress(vm.order.Address);
      vm.ewallet = {
        positive: getEwalletAmmount(vm.order.EwalletRecords, EWALLET_POSITIVE),
        negative: getEwalletAmmount(vm.order.EwalletRecords,EWALLET_NEGATIVE),
      };
      vm.ewallet.before = vm.order.Client.ewallet + vm.ewallet.negative - vm.ewallet.positive;
      vm.ewallet.current = vm.order.Client.ewallet;

      vm.isLoading = false;
      quotationService.getQuotationProducts(vm.order)
        .then(function(details){
          vm.order.Details = details;
          return quotationService.loadProductFilters(vm.order.Details);
        })
        .then(function(details2){
          vm.order.Details = details2;
          console.log(vm.order.Details);
        })

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
    if(payment.type == 'cash' || payment.type == 'cash-usd'){
      type = 'Pago de contado';
    }else if(payment.terminal && payment.msi){
      type = payment.msi + ' meses sin intereses';
    }
    return type;
  }

  function print(){
    window.print();
  }

  vm.init();

}
