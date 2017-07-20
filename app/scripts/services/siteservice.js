(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('siteService', siteService);

    /** @ngInject */
    function siteService($http, $q, api){

      var service = {
        findByHandle: findByHandle,
        getStoresIdMapper:getStoresIdMapper,
        test: test,
      };

      return service;

      function findByHandle(handle){
        var url = '/site/findbyhandle/' + handle;
        return api.$http.post(url);
      }

      function test(){
        var url = '/payment/test';
        return api.$http.post(url);
      }

      function getStoresIdMapper(){
        var storesMap = {
          '5876b417d21cb61c6e57db63': 'actualhome.com',
          '589b5fdd24b5055c104fd5b8': 'actualstudio.com',
          '58ab5fa9d21cb61c6ec4473c': 'actualkids.com' 
        };

        return storesMap;
      }

    }


})();
