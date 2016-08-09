(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('productService', productService);

    /** @ngInject */
    function productService($http, $q, api, storeService, localStorageService){

      var storePromotions = [];
      var service = {
        advancedSearch: advancedSearch,
        //formatProduct: formatProduct,
        formatSingleProduct: formatSingleProduct,
        formatProducts: formatProducts,
        getAllCategories: getAllCategories,
        getAllFilters: getAllFilters,
        getById: getById,
        getCategories: getCategories,
        getCategoryById: getCategoryById,
        getGroupProducts: getGroupProducts,
        getGroupVariants: getGroupVariants,
        getList: getList,
        getListNoImages: getListNoImages,
        getMainCategories: getMainCategories,
        getMainPromo: getMainPromo,
        getProductsByFilters: getProductsByFilters,
        search: search,
        searchByFilters: searchByFilters,
        searchCategoryByFilters: searchCategoryByFilters,
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
        if( product.Name && isUpperCase(product.Name) ) {
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
        product.mainPromo = getMainPromo(product);
        if(product.mainPromo){
          var maxDiscount = product.mainPromo.discountPg1;
          product.maxDiscount = maxDiscount;
          product.priceBefore = product.Price;
          product.Price = product.Price - ( ( product.Price / 100) * maxDiscount );
        }else{
          product.maxDiscount = 0;
          product.pricebefore = product.Price;
        }
        return product;
      }

      function formatSingleProduct(product){
        var deferred = $q.defer();
        var companyActive = localStorageService.get('companyActive');
        storeService.getPromosByCompany(companyActive).then(function(res){
          storePromotions = res.data;
          var fProduct = formatProduct(product);
          deferred.resolve(fProduct);
        });
        return deferred.promise;
      }

      function getMainPromo(product){
        if(product.Promotions && product.Promotions.length > 0){
          var indexMaxPromo = 0;
          var maxPromo = 0;
          product.Promotions = product.Promotions.filter(function(promotion){
            return _.findWhere(storePromotions, {id:promotion.id});
          });
          product.Promotions.forEach(function(promo, index){
            if(promo.discountPg1 >= maxPromo){
              maxPromo = promo.discountPg1;
              indexMaxPromo = index;
            }
          });
          return product.Promotions[indexMaxPromo];
        }else{
          return false;
        }
      }

      function formatProducts(products){
        var deferred = $q.defer();
        var companyActive = localStorageService.get('companyActive');
        storeService.getPromosByCompany(companyActive).then(function(res){
          storePromotions = res.data;
          var formatted = products.map(formatProduct);
          deferred.resolve(formatted);
        });
        return deferred.promise;
        //return formatted;
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
