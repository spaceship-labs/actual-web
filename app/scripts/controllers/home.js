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

function HomeCtrl($timeout, productService){
  var vm = this;
  vm.init = init;
  vm.areProductsLoaded = false;
  vm.groupProducts = groupProducts;

  vm.simulateLoading = simulateLoading;

  function init(){
    //vm.simulateLoading();
    productService.getList(1,{items:20}).then(function(res){
      var productsAux = res.data.data;
      vm.products = productService.formatProducts(productsAux);
      vm.productsGroups = vm.groupProducts(vm.products, 6);
      vm.areProductsLoaded = true;

    });
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

  /*
  vm.products = [
    {
      name:'Silla textura red',
      priceBefore: 2399,
      priceNow: 1499,
      images:[
        'images/chair.jpg',
        'images/chair2.jpg'
      ]
    },
    {
      name:'Mesa redonda cedro',
      priceBefore: 2399,
      priceNow: 1499,
      images:[
        'images/getMain8-287x287.jpg',
        'images/getMain8-287x287.jpg'
      ]
    },
    {
      name:'Sofa blanco 2 plazas',
      priceBefore: 2399,
      priceNow: 1499,
      images:[
        'images/1210-287x287.jpg',
        'images/1210-287x287.jpg'
      ]
    },
    {
      name:'Mesa 2 piezas',
      priceBefore: 2399,
      priceNow: 1499,
      images:[
        'images/prodotti-59268-relf13017b0-53eb-44c1-b59a-c8438d55cff7-287x287.jpg',
        'images/prodotti-59268-relf13017b0-53eb-44c1-b59a-c8438d55cff7-287x287.jpg'
      ]
    },
    {
      name:'Mesa redonda mimbre',
      priceBefore: 2399,
      priceNow: 1499,
      images:[
        'images/BALOU_daybed-forsite-011-287x287.jpg',
        'images/BALOU_daybed-forsite-011-287x287.jpg'
      ]
    } ,
    {
      name:'Sofa café 3 plazas',
      priceBefore: 2399,
      priceNow: 1499,
      images:[
        'images/All-one-divano-fisso-schienale-abbattuto-copy-287x287.jpg',
        'images/All-one-divano-fisso-schienale-abbattuto-copy-287x287.jpg'
      ]
    },
    {
      name:'s2 Silla textura red',
      priceBefore: 2399,
      priceNow: 1499,
      images:[
        'images/chair.jpg',
        'images/chair2.jpg'
      ]
    },
    {
      name:'s2 Mesa redonda cedro',
      priceBefore: 2399,
      priceNow: 1499,
      images:[
        'images/the-projects-basketO12_698-287x287.jpg',
        'images/the-projects-basketO12_698-287x287.jpg'
      ]
    },
    {
      name:'s2 Sofa blanco 2 plazas',
      priceBefore: 2399,
      priceNow: 1499,
      images:[
        'images/slide-Avenue-03-287x287.jpg',
        'images/slide-Avenue-03-287x287.jpg'
      ]
    },
    {
      name:'s2 Mesa 2 piezas',
      priceBefore: 2399,
      priceNow: 1499,
      images:[
        'images/Basket-grigio11-287x287.jpg',
        'images/Basket-grigio11-287x287.jpg'
      ]
    },
    {
      name:'s2 Mesa redonda mimbre',
      priceBefore: 2399,
      priceNow: 1499,
      images:[
        'images/arthur-1-287x287.jpg',
        'images/arthur-1-287x287.jpg'
      ]
    } ,
    {
      name:'s2 Sofa café 3 plazas',
      priceBefore: 2399,
      priceNow: 1499,
      images:[
        'images/ADD_LOOK-ROUND-SOFA-287x287.jpg',
        'images/ADD_LOOK-ROUND-SOFA-287x287.jpg',
      ]
    }

  ];
  */


  vm.init();
}

HomeCtrl.$inject = ['$timeout','productService'];
