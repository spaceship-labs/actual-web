(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('leadService', leadService);

    /** @ngInject */
    function leadService($http, $q, $rootScope, api){

      var service = {
        createLeadAndSendQuotation: createLeadAndSendQuotation,
        getQuotationLeads: getQuotationLeads   
      };

      return service;


      function createLeadAndSendQuotation(params){
        var url = '/lead/quotation/' + params.quotationId;
        return api.$http.post(url, params).then(function(res){
         return res.data;
        });
      }

      function getQuotationLeads(quotationId){
        var url = '/quotation/' + quotationId + '/leads';
        return api.$http.get(url).then(function(res){
         return res.data;
        });
      }


    }


})();
