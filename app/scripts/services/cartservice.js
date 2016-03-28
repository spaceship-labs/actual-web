(function (){
  'use strict';

  angular
    .module('dashexampleApp')
    .factory('cartService', cartService);

  function cartService(){
    var service = {
      getProducts: getProducts
    };

    function getProducts(){
      return products;
    }

    var products = [
      {
        name:'Silla textura red',
        priceBefore: 2399,
        priceNow: 1499,
        image: 'images/chair2.jpg'
      },
      {
        name:'Mesa redonda cedro',
        priceBefore: 2399,
        priceNow: 1499,
        image:
          'images/getMain8-287x287.jpg'
      },
      {
        name:'Sofa blanco 2 plazas',
        priceBefore: 2399,
        priceNow: 1499,
        image:'images/1210-287x287.jpg'
      },
      {
        name:'Mesa 2 piezas',
        priceBefore: 2399,
        priceNow: 1499,
        image: 'images/prodotti-59268-relf13017b0-53eb-44c1-b59a-c8438d55cff7-287x287.jpg',
      },
      {
        name:'Mesa redonda mimbre',
        priceBefore: 2399,
        priceNow: 1499,
        image: 'images/BALOU_daybed-forsite-011-287x287.jpg'
      } ,
      {
        name:'Sofa café 3 plazas',
        priceBefore: 2399,
        priceNow: 1499,
        image:'images/All-one-divano-fisso-schienale-abbattuto-copy-287x287.jpg'
      }
    ];

    return service;
  }

})();
