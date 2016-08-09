(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('clientService', clientService);

    /** @ngInject */
    function clientService($http, $q, $rootScope, api){

      var service = {
        create: create,
        getById: getById,
        getClients: getClients,
        getContacts: getContacts,
        update: update,
        updateFiscalInfo: updateFiscalInfo
      };

      return service;

      function create(params){
        var url = '/client/create/';
        return api.$http.post(url, params);
      }

      function getById(id){
        var url = '/client/findbyid/' + id;
        return api.$http.post(url);
      }

      function getClients(page, params){
        var p = page || 1;
        var url = '/client/find/';
        return api.$http.post(url,params);
      }

      function update(cardCode, params){
        var url = '/client/update/' + cardCode;
        return api.$http.post(url, params);
      }

      function getContacts(clientSlpCode){
        var url = '/client/'+clientSlpCode+'/contacts';
        return api.$http.post(url);
      }

      function updateFiscalInfo(id,cardCode,params){
        var url = '/client/update/fiscalinfo/' + id + '/' + cardCode;
        return api.$http.post(url, params);
      }

    }


})();
