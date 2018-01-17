(function (){
    'use strict';

    angular
        .module('actualWebApp')
        .factory('storeService', storeService);

    /** @ngInject */
    function storeService($http, $q, $rootScope, api){

      var service = {
        getPromosByStore: getPromosByStore,
      };

      return service;

      function getPromosByStore(id){
        var url = '/store/'+id+'/promotions';
        return api.$http.post(url);
      }

    }
})();
