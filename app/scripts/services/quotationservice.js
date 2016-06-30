(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('quotationService', quotationService);

    /** @ngInject */
    function quotationService($http, $q, $rootScope, api, Upload, productService){

      var service = {
        create: create,
        getById: getById,
        getByClient: getByClient,
        getList: getList,
        addRecord: addRecord,
        updateInfo: updateInfo,
        getQuotationProducts: getQuotationProducts
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

      function getQuotationProducts(quotation){
        var deferred = $q.defer();
        var productsIds = [];
        quotation.Details.forEach(function(detail){
          productsIds.push(detail.ItemCode);
        });
        var params = {
          filters: {
            ItemCode: productsIds
          }
        };
        var page = 1;
        productService.getList(page,params).then(function(res){
          var products = productService.formatProducts(res.data.data);
          //Match detail - product
          quotation.Details.forEach(function(detail){
            detail.Product = _.findWhere( products, {ItemCode : detail.ItemCode } );
          });

          deferred.resolve(quotation.Details);

        });
        return deferred.promise;
      }


    }


})();
