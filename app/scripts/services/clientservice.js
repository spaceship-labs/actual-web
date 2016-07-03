(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('clientService', clientService);

    /** @ngInject */
    function clientService($http, $q, $rootScope, api){

      var service = {
        getById: getById,
        getClients: getClients,
        update: update
      };

      return service;

      function getById(id){
        var url = '/client/findbyid/' + id;
        return api.$http.post(url);
      }

      function getClients(page, params){
        var p = page || 1;
        var url = '/client/find/';
        return api.$http.post(url,params);
      }

      function update(clientId, params){
        var url = '/client/update/' + clientId;
        return api.$http.post(url, params);
      }


    }


})();
