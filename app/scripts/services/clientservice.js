(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('clientService', clientService);

    /** @ngInject */
    function clientService($http, $q, $rootScope, api){

      var service = {
        buildAddressStringByContact:buildAddressStringByContact,
        create: create,
        createContact: createContact,
        createFiscalAddress: createFiscalAddress,
        getById: getById,
        getClients: getClients,
        getContacts: getContacts,
        getEwalletById: getEwalletById,
        getBalanceById: getBalanceById,
        getTitles: getTitles, 
        getGenders:getGenders,
        isClientFiscalDataValid: isClientFiscalDataValid,
        setClientDefaultData: setClientDefaultData,
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

      function createFiscalAddress(cardCode, params){
        var url = '/client/'+cardCode+'/fiscaladdress/create';
        return api.$http.post(url, params);
      }

      function getEwalletById(clientId){
        var url = '/client/'+clientId+'/ewallet';
        return api.$http.get(url);
      }

      function getBalanceById(clientId){
        var url = '/client/'+clientId+'/balance';
        return api.$http.get(url);        
      }

      function buildAddressStringByContact(contact){
        var address = '';
        address += 'Calle: ' + contact.Address;
        address += contact.U_Noexterior ? ', no. exterior: '+ contact.U_Noexterior : null;
        address += contact.U_Nointerior ? ', no. interior: '+ contact.U_Nointerior : null;
        address += contact.U_Colonia ? ', colonia: '+ contact.U_Colonia : null;
        address += contact.U_Mpio ? ', municipio: '+ contact.U_Mpio : null;
        address += contact.U_Ciudad ? ', ciudad: '+ contact.U_Ciudad : null;
        address += contact.U_Estado ? ', estado: '+ contact.U_Estado : null;
        address += contact.U_CP ? ', código postal: '+ contact.U_CP : null;
        address += contact.U_Estado ? ', estado: '+ contact.U_Estado : null;
        address += contact.U_Entrecalle ? ', entre calle: '+ contact.U_Entrecalle : null;
        address += contact.U_Ycalle ? ' y calle: '+ contact.U_Ycalle : null;
        address += contact.U_Notes1 ? ', referencias: '+ contact.U_Notes1 : null;
        return address;        
      }

      function isClientFiscalDataValid(client){
        if(client && client.FiscalAddress){
          return client.LicTradNum && client.FiscalAddress.companyName && client.FiscalAddress.companyName != '';
        }
        return false;
      }

      function setClientDefaultData(client){
        if(!client.FiscalAddress){
          client.FiscalAddress = {};
        }
        if(!client.FiscalAddress.U_Correos){
          client.FiscalAddress.U_Correos = angular.copy(client.E_Mail);
        }


        /*
        client.Contacts = client.Contacts.map(function(contact){
          if(!contact.E_Mail){
            contact.E_Mail = angular.copy(client.E_Mail);
          }
          if(!contact.FirstName){
            contact.FirstName = angular.copy(client.CardName);
          }
          if(!contact.Tel1){
            contact.Tel1 = angular.copy(client.Phone1);
          }
          if(!contact.Cellolar){
            contact.Cellolar = angular.copy(client.Cellular);
          }
          contact.editEnabled = false;

          return contact;
        });
        */

        return client;
      }

      function getTitles(){
        var titles = [
          {label:'Sr.', value:'Sr'},
          {label:'Sra.', value: 'Sra'},
          {label: 'Srita.', value: 'Srita'}
        ];
        return titles;
      }

      function getGenders(){
        var genders = [
          {label:'Masculino', value: 'M'},
          {label: 'Femenino', value: 'F'}
        ];
        return genders;      
      }


    }


})();
