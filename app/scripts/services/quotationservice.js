(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('quotationService', quotationService);

    /** @ngInject */
    function quotationService(
      $http, 
      $location, 
      $q, 
      $rootScope, 
      api, 
      Upload, 
      productService, 
      localStorageService,
      dialogService
    ){

      var service = {
        addDetail: addDetail,
        addProduct: addProduct,
        addMultipleProducts: addMultipleProducts,
        closeQuotation: closeQuotation,
        create: create,
        isValidStock: isValidStock,
        getActiveQuotation: getActiveQuotation,
        getActiveQuotationId: getActiveQuotationId,
        getById: getById,
        getByIdQuickRead: getByIdQuickRead,
        getCountByUser: getCountByUser,
        getList: getList,
        getGeneralList: getGeneralList,
        populateDetailsWithProducts: populateDetailsWithProducts,
        getQuotationTotals: getQuotationTotals,
        getCurrentStock: getCurrentStock,        
        getRecords: getRecords,
        getTotalByPaymentMethod: getTotalByPaymentMethod,
        getTotalsByUser: getTotalsByUser,
        getPaymentOptions: getPaymentOptions,
        getPayments: getPayments,
        getQuotationZipcodeDelivery: getQuotationZipcodeDelivery,
        getSapOrderConnectionLogs: getSapOrderConnectionLogs,
        loadProductsFilters: loadProductsFilters,
        newQuotation: newQuotation,
        mapDetailsStock: mapDetailsStock,
        removeDetail: removeDetail,
        removeDetailsGroup: removeDetailsGroup,
        removeCurrentQuotation: removeCurrentQuotation,
        setActiveQuotation: setActiveQuotation,
        sendByEmail: sendByEmail,
        showStockAlert: showStockAlert,
        update: update,
        updateDetails: updateDetails,
        updateSource: updateSource,
        updateAddress: updateAddress,
        validateQuotationStockById: validateQuotationStockById
      };

      return service;

      function create(params){
        var url = '/quotation/create';
        return api.$http.post(url,params);
      }

      function update(id, params){
        var url = '/quotation/update/' + id;
        return api.$http.post(url,params);
      }

      function updateDetails(id, params){
        var url = '/quotation/updatedetails/' + id;
        return api.$http.put(url,params);
      }

      function updateSource(id, params){
        var url = '/quotation/' + id + '/source';
        return api.$http.post(url, params);
      }

      function updateAddress(id, params){
        var url = '/quotation/' + id + '/address';
        return api.$http.put(url, params);
      }

      function getById(id, params){
        var url = '/quotation/findbyid/' + id;
        return api.$http.post(url, params);
      }

      function getByIdQuickRead(id, params){
        var url = '/quotation/findbyidquickread/' + id;
        return api.$http.post(url, params);
      }

      function getList(page, params){
        var p = page || 1;
        var url = '/quotation/find/' + p;
        return api.$http.post(url,params);
      }

      function getGeneralList(page, params){
        var p = page || 1;
        var url = '/quotation/all/find/' + p;
        return api.$http.post(url,params);
      }


      function addDetail(quotationId, params){
        var url = '/quotation/adddetail/' + quotationId;
        return api.$http.post(url, params);
      }

      function addMultipleDetails(quotationId, params){
        var url = '/quotation/addmultipledetails/' + quotationId;
        return api.$http.post(url, params);
      }

      function removeDetail(id, quotationId){
        var url = '/quotation/' + quotationId + '/removedetail/' + id;
        return api.$http.delete(url);
      }

      function removeDetailsGroup(detailsGroup, quotationId){
        var url = '/quotation/removedetailsgroup/' + quotationId;
        return api.$http.post(url, detailsGroup);
      }


      function getTotalsByUser(userId, params){
        var url = '/quotation/user/'+userId+'/totals';
        return api.$http.post(url,params);
      }

      function getCountByUser(userId, params){
        var url = '/quotation/user/'+userId+'/count';
        return api.$http.post(url,params);
      }

      function closeQuotation(id, params){
        var url = '/quotation/' + id  + '/close';
        return api.$http.post(url,params);
      }      

      function getSapOrderConnectionLogs(id){
        var url = '/quotation/' + id  + '/saporderconnectionlogs';
        return api.$http.post(url);
      }           


      function getTotalByPaymentMethod(quotation, paymentDiscountKey){
        var total = 0;
        if(quotation.Details){
          var details = quotation.Details;
          details.forEach(function(detail){
            if(detail.Product && detail.Product.priceBefore && detail.Product.mainPromo){
              var product = detail.Product;
              var discountPercent =  product.mainPromo[paymentDiscountKey];
              var price  = product.priceBefore - ( ( product.priceBefore / 100) * discountPercent);
              total += price * detail.quantity;
              //total+= detail.Product.Price * detail.quantity;
            }
          });
        }
        return total;
      }

      function populateDetailsWithProducts(quotation, options){
        options = options || {};
        var deferred = $q.defer();
        if(quotation && quotation.Details){
          var productsIds = quotation.Details.map(function(detail){
            return detail.Product; //product id
          });

          var params = {
            ids: productsIds,
            populate_fields: options.populate || []
          };

          productService.multipleGetByIds(params)
            .then(function(res){
              console.log('res', res);
              return productService.formatProducts(res.data);
            })
            .then(function(formattedProducts){
              
              //Match detail - product
              quotation.Details = quotation.Details.map(function(detail){
                detail.Product = _.findWhere( formattedProducts, {id : detail.Product } );
                return detail;
              });
              deferred.resolve(quotation.Details);
            
            })
            .catch(function(err){
              console.log('err', err);
              deferred.reject(err);
            });

        }else{
          deferred.resolve([]);
        }
        return deferred.promise;
      }

      function getActiveQuotation(){
        var deferred = $q.defer();
        var quotationId = localStorageService.get('quotation');
        console.log('quotationId', quotationId);
        if(!quotationId){
          deferred.resolve(false);
          return deferred.promise;
        }
        return getByIdQuickRead(quotationId);
      }

      function getActiveQuotationId(){
        return localStorageService.get('quotation');
      }

      function setActiveQuotation(quotationId){
        if(getActiveQuotationId() !== quotationId || !quotationId){
          localStorageService.set('quotation', quotationId);
          $rootScope.$broadcast('newActiveQuotation', quotationId);          
        }
      }

      function removeCurrentQuotation(){
        localStorageService.remove('quotation');
        $rootScope.$broadcast('newActiveQuotation', false); 
      }

      function newQuotation(params, options){
        options = options || {};
        create(params).then(function(res){
          var quotation = res.data;
          if(quotation){
            setActiveQuotation(quotation.id);

            $location.path('/quotations/edit/'+quotation.id)
              .search({startQuotation:true});
          }
        });
      }

      function createDetailFromParams(productId, params, quotationId){
        var detail = {
          Product: productId,
          quantity: params.quantity,
          QuotationWeb: quotationId,
          shipDate: params.shipDate,
          originalShipDate: params.originalShipDate,
          productDate: params.productDate,
          shipCompany: params.shipCompany,
          shipCompanyFrom: params.shipCompanyFrom,
          PromotionPackage: params.promotionPackage || null,
          PurchaseAfter: params.PurchaseAfter,
          PurchaseDocument: params.PurchaseDocument          
        };
        if(quotationId){
          detail.QuotationWeb = quotationId;
        }
        return detail;
      }

      function addProduct(productId, params){
        var quotationId = localStorageService.get('quotation');
        var detail = createDetailFromParams(productId, params, quotationId);
        if( quotationId ){

          detail.ZipcodeDelivery = params.zipcodeDeliveryId;
          //Agregar al carrito
          addDetail(quotationId, detail)
            .then(function(res){
              //setActiveQuotation(quotationId);
              $location.path('/quotations/edit/' + quotationId);
            })
            .catch(function(err){
              console.log(err);
            });

        }else{

          //Crear cotizacion con producto agregado
          var quotationParams = {
            Details: [detail],
            ZipcodeDelivery: params.zipcodeDeliveryId
          };

          create(quotationParams).then(function(res){
            var quotation = res.data;
            if(quotation){
              setActiveQuotation(quotation.id);
              $location.path('/quotations/edit/' + quotation.id);
            }
          })
          .catch(function(err){
            console.log(err);
          });
        }
      }

      //@params: Object products, containing id, quantity
      function addMultipleProducts(products, options){
        options = options || {};
        var quotationId = localStorageService.get('quotation');
        if( quotationId ){
          var detailsParams = products.map(function(product){
            return createDetailFromParams(product.id, product, quotationId);
          });

          var params = {
            Details: detailsParams,
            ZipcodeDelivery: options.zipcodeDeliveryId
          };

          addMultipleDetails(quotationId, params)
            .then(function(details){
              //setActiveQuotation(quotationId);
              $location.path('/quotations/edit/' + quotationId);
            })
            .catch(function(err){
              console.log(err);
            });

        }else{
          //Crear cotizacion con producto agregado
          var quotationParams = {
            ZipcodeDelivery: options.zipcodeDeliveryId,
            Details: products.map(function(product){
              var detail = createDetailFromParams(product.id, product);
              return detail;
            })
          };
          
          create(quotationParams).then(function(res){
            var quotation = res.data;
            if(quotation){
              setActiveQuotation(quotation.id);
              $location.path('/quotations/edit/' + quotation.id);
            }
          }).catch(function(err){
            console.log(err);
          });
        }
      }

      function loadProductsFilters(details){
        var deferred = $q.defer();

        if(details.length === 0){
          deferred.resolve(details);
          return deferred.promise;
        }

        productService.getAllFilters({quickread:true})
          .then(function(res){
            //Assign filters to every product
            var filters = res.data;
            details.forEach(function(detail){
              filters = filters.map(function(filter){
                filter.Values = [];
                
                if(detail.Product && detail.Product.FilterValues){
                  detail.Product.FilterValues.forEach(function(value){
                    if(value.Filter === filter.id){
                      filter.Values.push(value);
                    }
                  });
                }
                
                return filter;
              });

              filters = filters.filter(function(filter){
                return filter.Values.length > 0;
              });

              if(detail.Product && detail.Product.Filters){
                detail.Product.Filters = filters;
              }
            
            });

            deferred.resolve(details);

          }).catch(function(err){
            deferred.reject(err);
          });

        return deferred.promise;
      }

      function getQuotationTotals(quotationId, params){
        var url = '/quotation/totals/' + quotationId;
        return api.$http.post(url,params);
      }

      function getRecords(quotationId){
        var url = '/quotation/' + quotationId + '/records';
        return api.$http.post(url);
      }

      function sendByEmail(id){
        var url = '/quotation/sendemail/' + id;
        return api.$http.post(url);
      }

      function getCurrentStock(id){
        var url = '/quotation/getCurrentStock/' + id;
        return api.$http.post(url);
      }

      function getPaymentOptions(id, params){
        var url = '/quotation/'+id+'/paymentoptions';
        return api.$http.post(url, params);
      }

      function getPayments(id){
        var url = '/quotation/'+id+'/payments';
        return api.$http.get(url);
      }      

      function getQuotationZipcodeDelivery(id){
        var url = '/quotation/'+id+'/zipcodedelivery';
        return api.$http.get(url).then(function(res) {
          return res.data;
        });
      }      

      function mapDetailsStock(details, detailsStock){
        var details = details.map(function(detail){
          var detailStock = _.findWhere(detailsStock, {id:detail.id});
          if(detailsStock){
            detail.validStock = detailStock.validStock;
          }
          return detail;
        });
        return details;
      }

      function isValidStock(detailsStock){
        for(var i=0;i<detailsStock.length; i++){
          if(!detailsStock[i].validStock){
            return false;
          }
        }
        return true;
      }

      function validateQuotationStockById(id){
        var url = '/quotation/validatestock/' + id;
        var deferred = $q.defer();
        api.$http.post(url)
          .then(function(response){
            if(response.data.isValid){
              deferred.resolve(true);
            }else{
              deferred.resolve(false);
            }
          })
          .catch(function(err){
            deferred.reject(err);
          });
        return deferred.promise;
      }


      function showStockAlert(){
        var msg = 'Hay un cambio de disponibilidad en uno o más de tus articulos';
        dialogService.showDialog(msg);        
      }                

    }


})();