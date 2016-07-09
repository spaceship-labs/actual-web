(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('quotationService', quotationService);

    /** @ngInject */
    function quotationService($http, $location, $q, $rootScope, api, Upload, productService, localStorageService){

      var service = {
        create: create,
        update: update,
        getById: getById,
        getByClient: getByClient,
        getList: getList,
        addRecord: addRecord,
        addDetail: addDetail,
        getQuotationProducts: getQuotationProducts,
        calculateTotal: calculateTotal,
        calculateItemsNumber: calculateItemsNumber,
        getActiveQuotation: getActiveQuotation,
        addProduct: addProduct,
        removeDetail: removeDetail,
        newQuotation: newQuotation,
        setActiveQuotation: setActiveQuotation
      };

      return service;

      function create(params){
        var url = '/quotation/create';
        return api.$http.post(url,params);
      }

      function update(id,params){
        var url = '/quotation/update/' + id;
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

      function addDetail(quotationId, params){
        var url = '/quotation/adddetail/' + quotationId;
        return api.$http.post(url,params);
      }

      function removeDetail(id){
        var url = '/quotation/removedetail/' + id;
        return api.$http.post(url);
      }

      function calculateTotal(details){
        var total = 0;
        details.forEach(function(detail){
          total+= detail.Product.Price * detail.Quantity;
        });
        return total;
      }

      function calculateItemsNumber(details){
        var items = 0;
        details.forEach(function(detail){
          items+=  detail.Quantity;
        });
        return items;
      }

      function getQuotationProducts(quotation){
        var deferred = $q.defer();
        var productsIds = [];
        if(quotation){
          quotation.Details.forEach(function(detail){
            productsIds.push(detail.Product);
          });
          var params = {
            filters: {
              id: productsIds
            }
          };
          var page = 1;
          productService.getList(page,params).then(function(res){
            var products = productService.formatProducts(res.data.data);
            //Match detail - product
            quotation.Details.forEach(function(detail){
              detail.Product = _.findWhere( products, {id : detail.Product } );
            });

            deferred.resolve(quotation.Details);

          });
        }else{
          deferred.resolve([]);
        }
        return deferred.promise;
      }

      function getActiveQuotation(){
        var quotationId = localStorageService.get('quotation');
        return getById(quotationId);
      }

      function setActiveQuotation(quotationId){
        localStorageService.set('quotation', quotationId);
        $rootScope.$broadcast('newActiveQuotation', quotationId);
      }


      function newQuotation(params, goToSearch){
        create(params).then(function(res){
          var quotation = res.data;
          if(quotation){
            setActiveQuotation(quotation.id);
            $rootScope.$broadcast('newActiveQuotation', quotation);
            if(goToSearch){
              $location.path('/search');
            }else{
              $location.path('/quotations/edit/'+quotation.id);
            }
          }
        });
      }

      function addProduct(productId, params){
        var quotationId = localStorageService.get('quotation');
        if( quotationId ){
          //Agregar al carrito
          var detail = {
            Product: productId,
            Quantity: params.quantity,
            Quotation: quotationId
          };
          addDetail(quotationId, detail).then(function(res){
            console.log(res);
            var quotation = res.data;
            $rootScope.$broadcast('newActiveQuotation', quotation);
            $location.path('/quotations/edit/' + quotationId);
          });

        }else{
          //Crear cotizacion con producto agregado
          var params = {
            User: $rootScope.user.id,
            Details:[ {Product: productId, Quantity: params.quantity}  ]
          };
          create(params).then(function(res){
            var quotation = res.data;
            console.log(quotation);
            if(quotation){
              setActiveQuotation(quotation.id);
              $rootScope.$broadcast('newActiveQuotation', quotation);
              $location.path('/quotations/edit/' + quotation.id);
            }
          });
        }
      }


    }


})();
