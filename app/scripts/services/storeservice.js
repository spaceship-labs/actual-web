(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('storeService', storeService);

    /** @ngInject */
    function storeService($http, $q, $rootScope, api){

      var service = {
        getPromosByStore: getPromosByStore,
        getSellersByStore: getSellersByStore
      };

      return service;

      function getPromosByStore(id){
        var url = '/store/'+id+'/promotions';
        return api.$http.post(url);
      }

      function getSellersByStore(id){
        var url = '/store/'+id+'/sellers';
        return api.$http.post(url);
      }

    }


})();
