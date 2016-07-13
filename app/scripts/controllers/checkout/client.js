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
  vm.init = init;
  vm.getProducts = getProducts;
  vm.loadProductFilters = loadProductFilters;
  vm.getTotalPrice = getTotalPrice;
  vm.getTotalProducts = getTotalProducts;
  vm.continueProcess = continueProcess;
  vm.setAddress = setAddress;
  vm.updateAddress = updateAddress;

  vm.states = commonService.getStates();

  function init(){
    vm.isLoading = true;
    quotationService.getById($routeParams.id).then(function(res){
      vm.quotation = res.data;
      var productsIds = [];
      vm.quotation.Details.forEach(function(detail){
        productsIds.push(detail.Product);
      });

      vm.isLoading = false;

      //fillin address data with client info
      if(!vm.quotation.Address){
        console.log('No habia direccion');
        vm.setAddress();
      }


      vm.getProducts(productsIds);
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
    quotationService.update(vm.quotation.id, vm.quotation).then(function(res){
      vm.isLoading = false;
      $location.path('/checkout/paymentmethod/' + vm.quotation.id);
    });
  }

  function getProducts(productsIds){
    var params = {
      filters: {
        id: productsIds
      },
      populate_fields: ['FilterValues']
    };
    var page = 1;
    productService.getList(page,params).then(function(res){
      var products = productService.formatProducts(res.data.data);

      //Match detail - product
      vm.quotation.Details.forEach(function(detail){
        //Populating detail with product info.
        detail.Product = _.findWhere( products, {id : detail.Product } );
      });
      vm.loadProductFilters();
    });
  }

  function loadProductFilters(){
    productService.getAllFilters({quickread:true}).then(function(res){
      vm.filters = res.data;
      var filters = angular.copy(vm.filters);

      vm.quotation.Details.forEach(function(detail){

        filters = vm.filters.map(function(filter){
          filter.Values = [];
          detail.Product.FilterValues.forEach(function(value){
            if(value.Filter === filter.id){
              filter.Values.push(value);
            }
          });
          return filter;
        });

        filters = filters.filter(function(filter){
          return filter.Values.length > 0;
        });

        detail.Product.Filters = filters;

      });
    });

  }

  function getTotalPrice(){
    var total = 0;
    if(vm.quotation && vm.quotation.Details){
      total = quotationService.calculateTotal(vm.quotation.Details);
    }
    return total;
  }

  function getTotalProducts(){
    var total = 0;
    if(vm.quotation && vm.quotation.Details){
      total = quotationService.calculateItemsNumber(vm.quotation.Details)
    }
    return total;
  }

  vm.init();

}
