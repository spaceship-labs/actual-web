(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('packageService', packageService);

    /** @ngInject */
    function packageService($http, $q, api){

      var service = {
        getList: getList,
        getDetailedPackage: getDetailedPackage,
        getPackagesByCurrentStore: getPackagesByCurrentStore,
        getProductsByPackage: getProductsByPackage,
      };

      function getList(page, params){
        var p = page || 1;
        var url = '/packages/find/' + p;
        return api.$http.post(url,params);
      }

      function getPackagesByCurrentStore(){
        var url = '/store/packages';
        return api.$http.post(url);
      }

      function getProductsByPackage(id){
        var url = '/packages/'+id+'/products';
        return api.$http.post(url);
      }

      function getDetailedPackage(id){
        var url = '/packages/details/'+id;
        return api.$http.post(url);
      }

      return service;
    }

})();
