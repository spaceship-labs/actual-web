(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('siteService', siteService);

    /** @ngInject */
    function siteService($http, $q, api){

      var service = {
        findByHandle: findByHandle
      };

      return service;

      function findByHandle(handle){
        var url = '/site/findbyhandle/' + handle;
        return api.$http.post(url);
      }

    }


})();
