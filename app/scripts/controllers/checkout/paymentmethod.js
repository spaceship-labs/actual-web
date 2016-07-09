'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:CheckoutPaymentmethodCtrl
 * @description
 * # CheckoutPaymentmethodCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('CheckoutPaymentmethodCtrl', CheckoutPaymentmethodCtrl);

function CheckoutPaymentmethodCtrl($routeParams, $scope, $mdMedia, $mdDialog ,quotationService, productService){
  var vm = this;

  vm.selectSingle = selectSingle;
  vm.selectMultiple = selectMultiple;
  vm.applyDeposit = applyDeposit;

  vm.customFullscreen = $mdMedia('xs') || $mdMedia('sm');

  vm.singlePayment = true;
  vm.multiplePayment = false;

  vm.init = init;
  vm.getProducts = getProducts;
  vm.loadProductFilters = loadProductFilters;
  vm.getTotalPrice = getTotalPrice;
  vm.getTotalProducts = getTotalProducts;

  function init(){
    vm.isLoading = true;
    quotationService.getById($routeParams.id).then(function(res){
      console.log(res.data);
      vm.isLoading = false;
      vm.quotation = res.data;
      var productsIds = [];
      vm.quotation.Details.forEach(function(detail){
        productsIds.push(detail.Product);
      });
      vm.getProducts(productsIds);
    });
  }


  function selectSingle(){
    console.log('selectSingle');
    vm.singlePayment = true;
    vm.multiplePayment = false;

  }

  function selectMultiple(){
    console.log('selectMultiple');
    vm.multiplePayment = true;
    vm.singlePayment = false;
  }

  function applyDeposit(ev) {
    console.log('applyDeposit');
    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && vm.customFullscreen;
    $mdDialog.show({
      controller: DepositController,
      templateUrl: 'views/checkout/deposit-dialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: useFullScreen
    })
    .then(function(answer) {
      vm.status = 'You said the information was "' + answer + '".';
    }, function() {
      vm.status = 'You cancelled the dialog.';
    });

  }

  function DepositController($scope, $mdDialog) {
    $scope.hide = function() {
      $mdDialog.hide();
    };
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    $scope.answer = function(answer) {
      $mdDialog.hide(answer);
    };
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