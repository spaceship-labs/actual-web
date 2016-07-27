'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:CheckoutClientCtrl
 * @description
 * # CheckoutClientCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('CheckoutClientCtrl', CheckoutClientCtrl);

function CheckoutClientCtrl(commonService ,$timeout ,$routeParams, $rootScope, $location ,categoriesService, productService, quotationService, clientService, orderService){
  var vm = this;
  angular.extend(vm,{
    continueProcess: continueProcess,
    init: init,
    setAddress: setAddress,
    updateAddress: updateAddress,
  });

  function init(){
    vm.isLoading = true;
    quotationService.getById($routeParams.id).then(function(res){
      vm.quotation = res.data;
      vm.isLoading = false;
      //fillin address data with client info
      if(!vm.quotation.Address){
        console.log('No habia direccion');
        vm.setAddress();
      }
      quotationService.getQuotationProducts(vm.quotation).then(function(details){
        vm.quotation.Details = details;
        vm.totalPrice = quotationService.calculateTotal(vm.quotation);
        vm.subTotal = quotationService.calculateSubTotal(vm.quotation);
        vm.totalProducts = quotationService.calculateItemsNumber(vm.quotation);
        vm.totalDiscount = quotationService.calculateTotalDiscount(vm.quotation);
      });
    });
  }

  function setAddress(){
    vm.quotation.Address = {
      //name: vm.quotation.Client.deliveryName  || vm.quotation.Client.CardName,
      name: vm.quotation.Client.deliveryName,
      lastName: vm.quotation.Client.deliveryLastName,
      dialCode: vm.quotation.deliveryPhone,
      phone: vm.quotation.deliveryPhone,
      mobileDialCode: vm.quotation.Client.deliveryMobileDialCode,
      mobilePhone: vm.quotation.Client.deliveryMobilePhone,
      email: vm.quotation.Client.deliveryEmail,
      externalNumber: vm.quotation.Client.deliveryExternalNumber,
      internalNumber: vm.quotation.Client.deliveryInternalNumber,
      neighborhood:  vm.quotation.Client.deliveryNeighborhood,
      municipality:  vm.quotation.Client.deliveryMunicipality,
      city: vm.quotation.Client.deliveryCity,
      entity: vm.quotation.Client.deliveryEntity,
      zipCode:  vm.quotation.Client.deliveryZipCode,
      street:  vm.quotation.Client.deliveryStreet,
      street2:  vm.quotation.Client.deliveryStreet2,
      references: vm.quotation.Client.deliveryReferences,
    };
  }

  function updateAddress(){
    vm.isLoading = true;
    $timeout(function(){
      vm.setAddress();
      vm.isLoading = false;
    },1000);
  }

  function continueProcess(){
    vm.isLoading = true;
    var params = angular.copy(vm.quotation);
    if(params.Details){
      params.Details = params.Details.map(function(detail){
        detail.Product = detail.Product.id;
        return detail;
      });
    }
    quotationService.update(vm.quotation.id, params).then(function(res){
      vm.isLoading = false;
      $location.path('/checkout/paymentmethod/' + vm.quotation.id);
    });
  }


  vm.init();

}
