(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('clientService', clientService);

    /** @ngInject */
    function clientService($http, $q, $rootScope, api){

      var service = {
        getById: getById
      };

      return service;

      function getById(id){
        var url = '/client/findbyid/' + id;
        return api.$http.post(url);
      }



    }


})();
