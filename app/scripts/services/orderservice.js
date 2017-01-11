(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('orderService', orderService);

    /** @ngInject */
    function orderService($http, $q, $rootScope, api){

      var service = {
        calculateBalance: calculateBalance,
        create: create,
        createFromQuotation: createFromQuotation,
        addPayment: addPayment,
        getEwalletAmmount: getEwalletAmmount,
        getList: getList,
        getById: getById,
        getTotalsByUser: getTotalsByUser,
        getCountByUser: getCountByUser,
        formatAddress: formatAddress
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

      function createFromQuotation(quotationId, params){
        var url = '/order/createfromquotation/' + quotationId;
        return api.$http.post(url,params);
      }

      function getById(id){
        var url = '/order/findbyid/' + id;
        return api.$http.post(url);
      }

      function getTotalsByUser(userId, params){
        var url = '/order/user/'+userId+'/totals';
        return api.$http.post(url,params);
      }

      function getCountByUser(userId, params){
        var url = '/order/user/'+userId+'/count';
        return api.$http.post(url,params);
      }

      function calculateBalance(paid, total){
        return (paid - total);
      }

      function getEwalletAmmount(ewalletRecords, type){
        ewalletRecords = ewalletRecords || [];
        ewalletRecords = ewalletRecords.filter(function(record){
          return record.type === type;
        });
        var amount = ewalletRecords.reduce(function(acum, record){
          acum += record.amount;
          return acum;
        },0);
        return amount;
      }

      function formatAddress(address){
        //TODO: check why address is empty in some orders
        if(!address){
          return {};
        }
        address.name = (address.FirstName&&address.LastName) ? address.FirstName+' '+address.LastName : address.Name;
        address.address = address.Address;
        address.phone = address.phone || address.Tel1;
        address.mobile = address.mobilePhone || address.Cellolar;
        return address;
      }      

    }


})();
