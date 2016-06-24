'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:QuotationsEditCtrl
 * @description
 * # QuotationsEditCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('QuotationsEditCtrl', QuotationsEditCtrl);

function QuotationsEditCtrl($location,$routeParams, $q ,productService, $rootScope, commonService, quotationService){

  var vm = this;

  vm.init = init;
  vm.getProducts = getProducts;

  function init(){
    quotationService.getById($routeParams.id).then(function(res){
      console.log(res.data);
      vm.quotation = res.data;
      var productsIds = [];
      vm.quotation.Details.forEach(function(prod){
        productsIds.push(prod.ItemCode);
      });
      vm.getProducts(productsIds);
    });
  }

  function getProducts(productsIds){
    var params = {
      filters: {
        ItemCode: productsIds
      }
    };
    var page = 1;
    productService.getList(page,params).then(function(res){
      vm.quotation.Products = res.data;
      console.log(vm.quotation.Products);
    });
  }

  vm.init();

}
