(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('quotationService', quotationService);

    /** @ngInject */
    function quotationService($http, $q, $rootScope, api, Upload){

      var service = {
        create: create,
        getById: getById,
        getByClient: getByClient,
        getList: getList,
        addRecord: addRecord,
        updateInfo: updateInfo
      };

      return service;

      function create(params){
        var url = '/quotation/create';
        return api.$http.post(url,params);
      }

      function getById(id){
        var url = '/quotation/findbyid/' + id;
        return api.$http.post(url);
      }

      function getByClient(page, params){
        var p = page || 1;
        var url = '/quotation/findbyclient/' + p;
        return api.$http.post(url,params);
      }

      function getList(page, params){
        var p = page || 1;
        var url = '/quotation/find/' + p;
        return api.$http.post(url,params);
      }

      function addRecord(quotationId, params){
        var url = '/quotation/addrecord/' + quotationId;
        return Upload.upload({url: api.baseUrl + url, data:params});
        //return api.$http.post(url,params);
      }

      function updateInfo(quotationId, params){
        var url = '/quotation/updateinfo/' + quotationId;
        return api.$http.post(url,params);
      }

    }


})();
