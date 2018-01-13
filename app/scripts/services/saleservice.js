(function (){
    'use strict';

    angular
        .module('actualWebApp')
        .factory('saleService', saleService);

    /** @ngInject */
    function saleService($http, $q, $rootScope, api){

      var service = {
        getList: getList
      };

      return service;

      function getList(page, params){
        var p = page || 1;
        var url = '/sale/find/' + p;
        return api.$http.post(url,params);
      }

    }


})();
