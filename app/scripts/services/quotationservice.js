(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('quotationService', quotationService);

    /** @ngInject */
    function quotationService($http, $q, $rootScope, api){

      var service = {
        create: create,
        getById: getById,
        getByClient: getByClient
      };

      return service;

      function create(params){
        var url = '/quotation/create';
        return api.$http.post(url,params);
      }

      function getById(id){
        var url = '/quotation/findbyid/' + id;
        return api.$http.post(url);
      }

      function getByClient(page, params){
        var p = page || 1;
        var url = '/quotation/findbyclient/' + p;
        return api.$http.post(url,params);
      }

    }


})();
