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

function CheckoutClientCtrl(commonService ,$routeParams, $rootScope, $location ,categoriesService, productService, quotationService, clientService, orderService){
  var vm = this;
  vm.init = init;
  vm.getProducts = getProducts;
  vm.loadProductFilters = loadProductFilters;
  vm.getTotalPrice = getTotalPrice;
  vm.getTotalProducts = getTotalProducts;
  vm.continueProcess = continueProcess;

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
      if(!vm.quotation.Address ){
        vm.quotation.Address = {
          name: vm.quotation.Client.CardName,
          lastName: '',
          phone: vm.quotation.Client.Phone,
          mobilePhone: vm.quotation.Client.Cellular,
          email: vm.quotation.Client.E_Mail
        };
      }


      vm.getProducts(productsIds);
    });
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
