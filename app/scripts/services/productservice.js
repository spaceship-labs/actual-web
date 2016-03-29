(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('productService', productService);

    /** @ngInject */
    function productService($http, $q, api){

      var service = {
        getList: getList,
        getById: getById,
        search: search,
        formatProduct: formatProduct,
        formatProducts: formatProducts
      };

      return service;

      function getList(page, params){
        var p = page || 1;
        var url = '/product/find/' + p;
        return api.$http.post(url,params);
      }

      function getById(id){
        var url = '/product/findbyid/' + id;
        return api.$http.post(url);
      }

      function search(params){
        var url = '/product/search/';
        return api.$http.post(url, params);
      }

      function formatProduct(product){
        //The prices item in pos. 0 belongs to the Public price list in SAP
        if(product.prices && product.prices[0]){
          product.price = {
            currency: product.prices[0].Currency,
            value: product.prices[0].Price,
            priceList: product.prices[0].PriceList
          }
        }else{
         //Default
         product.price = {currency:'MXP', value:0, priceList:0};
        }

        //Setting icon and images
        if(product.icon_filename && product.icon_filename != 'null'){

          product.icons = [
            {url: api.baseUrl + '/uploads/products/' +  product.icon_filename, size:'default'}
          ];

          api.imageSizes.avatar.forEach(function(size){
            product.icons.push({
              url: api.baseUrl + '/uploads/products/'  + size +  product.icon_filename,
              size: size
            });
          });

        }else{
          product.icons = [
            {url: '/images/b-287x287.jpg', size:'default'}
          ];
        }

        return product;
      }

      function formatProducts(products){
        var formatted = products.map(formatProduct);

        return formatted;
      }


    }


})();
