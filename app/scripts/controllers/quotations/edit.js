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
  vm.loadProductFilters = loadProductFilters;
  vm.getTotalPrice = getTotalPrice;
  vm.getTotalProducts = getTotalProducts;

  vm.recordTypes = ['Whatsapp', 'Llamada'];

  vm.records = [
    {
      date:'15-May-2016 | 10:00 am',
      eventType: 'Whatsapp',
      user:'Azucena Barrón',
      recordDate: '16-May-2016 | 9:30 am',
      files:'2 archivo(s)'
    },
    {
      date:'15-May-2016 | 10:00 am',
      eventType: 'Email',
      user:'Azucena Barrón',
      recordDate: '16-May-2016 | 9:30 am',
      files:'2 archivo(s)'
    },
    {
      date:'15-May-2016 | 10:00 am',
      eventType: 'Llamada',
      user:'Azucena Barrón',
      recordDate: '16-May-2016 | 9:30 am',
      files:'2 archivo(s)'
    },
  ];


  function init(){
    quotationService.getById($routeParams.id).then(function(res){
      console.log(res.data);
      vm.quotation = res.data;
      var productsIds = [];
      vm.quotation.Details.forEach(function(detail){
        productsIds.push(detail.ItemCode);
      });
      vm.getProducts(productsIds);
    });
  }

  function getProducts(productsIds){
    var params = {
      filters: {
        ItemCode: productsIds
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
        detail.Product = _.findWhere( products, {ItemCode : detail.ItemCode } );
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
        if(detail.Product){
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
