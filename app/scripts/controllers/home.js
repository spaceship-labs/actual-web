'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:HomeCtrl
 * @description
 * # HomeCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('HomeCtrl', HomeCtrl);

function HomeCtrl($timeout, productService, api){
  var vm = this;
  angular.extend(vm,{
    areProductsLoaded: false,
    api: api,
    groupProducts: groupProducts,
    init: init,
    simulateLoading: simulateLoading
  });

  function init(){
    //vm.simulateLoading();
    /*
    var page = 1;
    var query = {
      items:20,
      //orderby: 'OnHand DESC'
    };
    productService.getList(page, query).then(function(res){
      var productsAux = res.data.data;
      vm.products = productService.formatProducts(productsAux);
      console.log(vm.products);
      vm.productsGroups = vm.groupProducts(vm.products, 6);
      vm.areProductsLoaded = true;

      vm.productsGallery = [
        'http://cafafdaa38a2d7c9529b-6ed6be8f68df7536cde1676c1863b473.r79.cf1.rackcdn.com/uploads/products/gallery/14655953998447618690.png',
        'http://cafafdaa38a2d7c9529b-6ed6be8f68df7536cde1676c1863b473.r79.cf1.rackcdn.com/uploads/products/gallery/14655953998567932972.png',
        'http://cafafdaa38a2d7c9529b-6ed6be8f68df7536cde1676c1863b473.r79.cf1.rackcdn.com/uploads/products/gallery/14655953998528871884.png',
        'http://cafafdaa38a2d7c9529b-6ed6be8f68df7536cde1676c1863b473.r79.cf1.rackcdn.com/uploads/products/gallery/14658316829631008869.png',
        'http://cafafdaa38a2d7c9529b-6ed6be8f68df7536cde1676c1863b473.r79.cf1.rackcdn.com/uploads/products/gallery/14658316829724450631.png'
      ];
    });
    */
  }

  function groupProducts(arr, chunkSize) {
      var groups = [], i;
      for (i = 0; i < arr.length; i += chunkSize) {
          groups.push(arr.slice(i, i + chunkSize));
      }
      return groups;
  }

  function simulateLoading(){
    $timeout(function(){
      vm.areProductsLoaded = true;
    },500);
  }


  //vm.init();
}

HomeCtrl.$inject = ['$timeout','productService','api'];
