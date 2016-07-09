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

function CheckoutClientCtrl(commonService ,$routeParams, $location ,categoriesService, productService, quotationService, clientService){
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
      console.log(res.data);
      vm.quotation = res.data;
      var productsIds = [];
      vm.quotation.Details.forEach(function(detail){
        productsIds.push(detail.Product);
      });

      clientService.getById(vm.quotation.Client.id).then(function(res){
        vm.client = res.data;
        vm.isLoading = false;

        console.log(vm.client);

        //fillin address data with client info
        if(!vm.quotation.Address ){
          vm.quotation.Address = {
            name: vm.client.CardName,
            lastName: '',
            phone: vm.client.Phone,
            mobilePhone: vm.client.Cellular,
            email: vm.client.E_Mail
          };
        }

        console.log(vm.quotation.Address);

      });

      vm.getProducts(productsIds);
    });
  }

  function continueProcess(){
    vm.isLoading = true;
    quotationService.update(vm.quotation.id, vm.quotation).then(function(res){
      console.log(res);
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
      //vm.quotation.Products = res.data;
      var products = productService.formatProducts(res.data.data);

      console.log(products);

      //Match detail - product
      vm.quotation.Details.forEach(function(detail){
        //Populating detail with product info.
        detail.Product = _.findWhere( products, {id : detail.Product } );
        console.log(detail);
      });

      console.log(vm.quotation.Details);
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

        //console.log(vm.filters);
        detail.Product.Filters = filters;

      });
    });

    console.log(vm.quotation);
  }

  function getTotalPrice(){
    var total = 0;
    if(vm.quotation && vm.quotation.Details){
      vm.quotation.Details.forEach(function(detail){
        if(detail.Product && detail.Product.Price){
          total += detail.Product.Price * detail.Quantity;
        }
      });
    }
    return total;
  }

  function getTotalProducts(){
    var total = 0;
    if(vm.quotation && vm.quotation.Details){
      vm.quotation.Details.forEach(function(detail){
        total += detail.Quantity;
      });
    }
    return total;
  }

  vm.init();

}
