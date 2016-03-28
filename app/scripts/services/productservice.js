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
        search: search
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

      function search(id){
        var url = '/product/search/';
        return api.$http.post(url);
      }


    }


})();
