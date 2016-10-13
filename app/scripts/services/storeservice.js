(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('storeService', storeService);

    /** @ngInject */
    function storeService($http, $q, $rootScope, api){

      var service = {
        getPromosByStore: getPromosByStore,
        getSellersByStore: getSellersByStore,
        getAllStores: getAllStores,
        countSellers: countSellers,
        commissionables: commissionables
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

      function getAllStores() {
        var url = '/store/getAll';
        return api.$http.get(url).then(function(res){
          return res.data;
        });
      }

      function countSellers(store) {
        var url    = '/store/countSellers';
        var params = {
          store: store
        };
        return api.$http.get(url, params).then(function(res) {
          return res.data;
        });
      }

      function commissionables(store) {
        var url    = '/store/getCommissionables';
        var params = store ? {store: store} : {};
        return api.$http.get(url, params).then(function(res) {
          return res.data;
        });
      }
    }
})();
