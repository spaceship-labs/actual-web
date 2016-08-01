(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('storeService', storeService);

    /** @ngInject */
    function storeService($http, $q, $rootScope, api){

      var service = {
        getPromosByCompany: getPromosByCompany
      };

      return service;

      function getPromosByCompany(id){
        var url = '/store/'+id+'/promotions';
        return api.$http.post(url);
      }

    }


})();
