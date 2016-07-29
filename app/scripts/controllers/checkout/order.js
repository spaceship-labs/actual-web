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

function CheckoutOrderCtrl(commonService ,$routeParams, $rootScope, $location, quotationService, orderService){
  var vm = this;
  angular.extend(vm,{
    init: init,
    print: print,
    getPaymentType: getPaymentType,
    formatAddress: formatAddress,
    isLoading: false
  });

  function init(){
    //vm.isLoading = false;
    vm.isLoading = true;
    orderService.getById($routeParams.id).then(function(res){
      vm.order = res.data;
      console.log(vm.order);
      vm.order.Details = vm.order.Details || [];
      vm.order.Address = vm.formatAddress(vm.order.Address);
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
    })
    .catch(function(err){
      console.log(err);
      vm.isLoading = false;
    });

  }

  function formatAddress(address){
    address.name = (address.firstName&&address.lastName) ? address.firstName+' '+address.lastName : address.name;
    address.address = address.address;
    address.phone = (address.phone) ? address.dialCode + ' ' + address.phone : address.phone1;
    address.mobile = (address.mobilePhone) ? address.mobileDialCode + ' ' + address.mobilePhone : address.mobileSAP;
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
