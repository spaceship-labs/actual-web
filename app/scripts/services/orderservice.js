(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('orderService', orderService);

    /** @ngInject */
    function orderService($http, $q, $rootScope, api){

      var service = {
        create: create,
        addPayment: addPayment,
        getList: getList
      };

      return service;

      function create(params){
        var url = '/order/create';
        return api.$http.post(url, params);
      }

      function addPayment(orderId, params){
        var url = '/order/addpayment/' + orderId;
        return api.$http.post(url,params);
      }

      function getList(page, params){
        var p = page || 1;
        var url = '/order/find/' + p;
        return api.$http.post(url,params);
      }

      function createFromQuotation(quotationId){
        var url = '/order/createfromquotation/' + quotationId;
        return api.$http.post(url);
      }



    }


})();
