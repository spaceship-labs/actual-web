(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('userService', userService);

    /** @ngInject */
    function userService($http, $q, $rootScope, api){
      var service = {
        getStores: getStores,
        getActiveStore: getActiveStore,
        getCashReport: getCashReport,
        getMyUser: getMyUser,
        getUserClient: getUserClient,        
        getUserFiscalAddress: getUserFiscalAddress,
        update: update,
        sendPasswordRecovery: sendPasswordRecovery,
        resetPassword: resetPassword,
        register: register,
        getUserContacts: getUserContacts,
        createUserContact: createUserContact,
        updateUserContact: updateUserContact,
        updateUserFiscalAddress: updateUserFiscalAddress
      };

      return service;

      function resetPassword(params){
        var url = '/user/update_password';
        return api.$http.post(url, params);        
      }

      function sendPasswordRecovery(email){
        var params = {email:email};
        var url = '/user/send_password_recovery';
        return api.$http.post(url, params);
      }

      function getUserClient(){
        var url = '/me/client';
        return api.$http.get(url).then(function(res){
          return res.data;
        });
      }

      function createUserContact(params){
        var url = '/me/client/contacts';
        return api.$http.post(url, params).then(function(res){
          return res.data;
        });
      }

      function updateUserContact(contactCode, params){
        var url = '/me/client/contacts/'+contactCode;
        return api.$http.put(url, params).then(function(res){
          return res.data;
        });
      }

      function getUserContacts(params){
        var url = '/me/client/contacts';
        return api.$http.get(url, params).then(function(res){
          return res.data;
        });
      }

      function getUserFiscalAddress(){
        var url = '/me/client/fiscaladdress';
        return api.$http.get(url).then(function(res){
         return res.data;
        });
      }

      function updateUserFiscalAddress(params){
        var url = '/me/client/fiscaladdress';
        return api.$http.put(url, params).then(function(res){
         return res.data;
        });
      }

      function getMyUser(){
        var url = '/me';
        return api.$http.get(url).then(function(res){
          return res.data;
        });
      }

      function register(params){
        var url = '/user/register/';
        return api.$http.post(url,params);
      }

      function update(params){
        var url = '/me/update';
        return api.$http.put(url, params).then(function(res){
         return res.data;
        });
      }

      function getStores(email) {
        var url      = '/user/stores';
        var params   = {email: email};
        return api.$http.get(url, params).then(function(res){
         return res.data;
        });
      }

      function getActiveStore() {
        var url      = '/me/activeStore';
        return api.$http.get(url).then(function(res){
         return res.data;
        });
      }

      function getCashReport(params){
        var url = '/me/cashreport';
        return api.$http.post(url, params);
      }

    }
})();
