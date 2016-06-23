(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('saleService', saleService);

    /** @ngInject */
    function saleService($http, $q, $rootScope, api){

      var service = {
        getByClient: getByClient
      };

      return service;

      function getByClient(page, params){
        var p = page || 1;
        var url = '/sale/findbyclient/' + p;
        return api.$http.post(url,params);
      }

    }


})();
