(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('clientService', clientService);

    /** @ngInject */
    function clientService($http, $q, $rootScope, api){

      var service = {
        create: create,
        createContact: createContact,
        getById: getById,
        getClients: getClients,
        getContacts: getContacts,
        update: update,
        updateFiscalAddress: updateFiscalAddress,
        updateContact: updateContact
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

      function updateFiscalAddress(id,cardCode,params){
        var url = '/client/update/fiscaladdress/' + id + '/' + cardCode;
        return api.$http.post(url, params);
      }

      function updateContact(contactCode, cardCode, params){
        var url = '/client/'+cardCode+'/update/contact/'+contactCode;
        return api.$http.post(url, params);
      }

      function createContact(cardCode, params){
        var url = '/client/'+cardCode+'/contact/create';
        return api.$http.post(url, params);
      }

    }


})();
