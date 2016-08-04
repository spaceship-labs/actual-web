(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('userService', userService);

    /** @ngInject */
    function userService($http, $q, $rootScope, api){
      var service = {
        getClients: getClients,
        getBrokers: getBrokers,
        getUser: getUser,
        update: update
      };

      return service;

      function getClients(page, params){
        //var seller = params.SlpCode;
        var p      = page || 1;
        var seller = $rootScope.user.SlpCode || 49;
        var url    = '/client/findbyseller/' + seller;
        return api.$http.post(url, params);
      }

      function getUser(id){
        var url = '/user/findbyid/' + id;
        return api.$http.post(url);
      }

      function update(params){
        var url = '/me/update';
        return api.$http.post(url, params);
      }

      function getBrokers(page, limit) {
        var url      = '/user/brokers';
        var params   = {};
        params.page  = page  || 0;
        params.limit = limit || 10;
        return api.$http.get(url, params).then(function(res){
         return res.data;
        });
      }
    }
})();
