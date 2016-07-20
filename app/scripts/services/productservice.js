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
        formatProducts: formatProducts,

        getListNoImages: getListNoImages,

        getCategories: getCategories,
        getMainCategories: getMainCategories,
        getAllCategories: getAllCategories,
        getCategoryById: getCategoryById,

        getAllFilters: getAllFilters,

        getGroupVariants: getGroupVariants,
        getGroupProducts: getGroupProducts,

        getProductsByFilters: getProductsByFilters,

        advancedSearch: advancedSearch,
        searchByFilters: searchByFilters,
        searchCategoryByFilters: searchCategoryByFilters

      };

      return service;

      function getList(page, params){
        var p = page || 1;
        var url = '/product/find/' + p;
        return api.$http.post(url,params);
      }

      function getListNoImages(page, params){
        var p = page || 1;
        var url = '/product/find/' + p;
        params.noimages = true;
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

      function isUpperCase(str) {
          return str === str.toUpperCase();
      }

      function capitalizeFirstLetter(string){
        var text = string.toLowerCase();
        return text.charAt(0).toUpperCase() + text.slice(1);
      }


      function formatProduct(product){
        //product.Name = product.Name || capitalizeFirstLetter(product.ItemName);
        if( product.Name && isUpperCase(product.Name) ){
          product.Name = capitalizeFirstLetter(product.ItemName);
        }
        if (product.icon_filename && product.icon_filename !== 'null') {
          product.icons = [
            {url: api.baseUrl + '/uploads/products/' +  product.icon_filename, size:'default'}
          ];
          api.imageSizes.avatar.forEach(function(size){
            product.icons.push({
              url: api.baseUrl + '/uploads/products/'  + size +  product.icon_filename,
              size: size
            });
          });
        } else {
          product.icons = [
            {url: '', size:'default'}
          ];
        }

        if(product.Promotions && product.Promotions.length > 0){
          var discounts = product.Promotions.map(function(promo){
            return promo.discountPg1;
          });
          var maxDiscount = Math.max.apply(Math,discounts);
          console.log('maxDiscount: ' + maxDiscount);
          product.maxDiscount = maxDiscount;
          product.priceBefore = product.Price;
          product.Price = product.Price - ( ( product.Price / 100) * maxDiscount );
        }else{
          product.maxDiscount = 0;
          product.pricebefore = product.Price;
        }

        console.log(product);
        return product;
      }



      function formatProducts(products){
        var formatted = products.map(formatProduct);
        return formatted;
      }

      //CATEGORIES
      function getCategories(page, params){
        var p = page || 1;
        var url = '/productcategory/find/' + p;
        return api.$http.post(url, params);
      }

      function getMainCategories(){
        var url = '/productcategory/getmaincategories';
        return api.$http.post(url);
      }

      function getAllCategories(){
        var url = '/productcategory/getallcategories';
        return api.$http.post(url);
      }

      function getCategoryById(id){
        var url = '/productcategory/findbyid/' + id;
        return api.$http.post(url);
      }

      function getAllFilters(params){
        var url = '/productfilter/list/';
        return api.$http.post(url,params);
      }

      function getGroupVariants(id){
        var url = '/productgroup/getgroupvariants/' + id;
        return api.$http.post(url);
      }

      function getGroupProducts(params){
        var id = params.id;
        var url = '/productgroup/getvariantgroupproducts/' + id;
        return api.$http.post(url);
      }

      //TODO: Remove function
      function getProductsByFilters(params){
        var url = '/productfiltervalue/getproducts';
        return api.$http.post(url,params);
      }

      function advancedSearch(params){
        var url = '/product/advancedsearch/';
        return api.$http.post(url, params);
      }

      function searchByFilters(params){
        var url = '/product/searchbyfilters/';
        return api.$http.post(url, params);
      }

      function searchCategoryByFilters(params) {
        var url = '/ProductSearch/searchByCategory';
        return api.$http.post(url, params);
      }

    }


})();
