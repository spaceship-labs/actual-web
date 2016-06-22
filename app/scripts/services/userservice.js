(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('userService', userService);

    /** @ngInject */
    function userService($http, $q, $rootScope, api){

      var service = {
        getClients: getClients
      };

      return service;

      function getClients(page, params){
        var p = page || 1;
        //var seller = params.SlpCode;
        var seller = $rootScope.user.SlpCode || 49;
        var url = '/client/findbyseller/' + seller;
        return api.$http.post(url,params);
      }



    }


})();
