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
      dialogService,
      deliveryService
    ){

      var service = {
        PAYMENT_ATTEMPTS_LIMIT: 3,
        addDetail: addDetail,
        addProduct: addProduct,
        addMultipleProducts: addMultipleProducts,
        adjustSameProductsDeliveriesAndStock: adjustSameProductsDeliveriesAndStock,
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
        localMultipleDetailsUpdate: localMultipleDetailsUpdate,
        localDetailUpdate: localDetailUpdate,
        localDetailUpdateWithNewValues: localDetailUpdateWithNewValues,
        localQuotationUpdate: localQuotationUpdate,
        localQuotationUpdateWithNewValues: localQuotationUpdateWithNewValues,
        mapDetailsOriginalValues: mapDetailsOriginalValues,
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
        getAddress: getAddress,
        validateQuotationStockById: validateQuotationStockById,
        getQuotationPaymentAttempts: getQuotationPaymentAttempts
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

      function getAddress(id, params){
        var url = '/quotation/' + id + '/address';
        return api.$http.get(url, params).then(function(res){
          return res.data;
        });        
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

      function getQuotationPaymentAttempts(id){
        var url = '/quotation/'+id+'/paymentattempts';
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

      function localMultipleDetailsUpdate(details){
        return details.map(localDetailUpdate);
      }

      function localDetailUpdate(detail){
        detail.subtotal = detail.quantity * detail.unitPrice;
        detail.total = detail.quantity * detail.unitPriceWithDiscount;

        detail.totalPg1 = detail.quantity * detail.unitPriceWithDiscountPg1;
        detail.totalPg2 = detail.quantity * detail.unitPriceWithDiscountPg2;
        detail.totalPg3 = detail.quantity * detail.unitPriceWithDiscountPg3;
        detail.totalPg4 = detail.quantity * detail.unitPriceWithDiscountPg4;
        detail.totalPg5 = detail.quantity * detail.unitPriceWithDiscountPg5; 
        return detail;
      }

      function localDetailUpdateWithNewValues(detail, newDetailValues){
        detail.unitPrice              = newDetailValues.unitPrice;
        detail.discountPercentPromos  = newDetailValues.discountPercentPromos;
        detail.discountPercent        = newDetailValues.discountPercent;
        detail.discount               = newDetailValues.discount;
        detail.subtotal               = newDetailValues.subtotal;
        detail.total                  = newDetailValues.total;

        detail.unitPriceWithDiscount    = newDetailValues.unitPriceWithDiscount;
        detail.unitPriceWithDiscountPg1 = newDetailValues.unitPriceWithDiscountPg1;
        detail.unitPriceWithDiscountPg2 = newDetailValues.unitPriceWithDiscountPg2;
        detail.unitPriceWithDiscountPg3 = newDetailValues.unitPriceWithDiscountPg3;
        detail.unitPriceWithDiscountPg4 = newDetailValues.unitPriceWithDiscountPg4;
        detail.unitPriceWithDiscountPg5 = newDetailValues.unitPriceWithDiscountPg5;


        detail.Promotion               = newDetailValues.Promotion;
        detail.PromotionPackageApplied = newDetailValues.PromotionPackageApplied;
        detail.discountName            = newDetailValues.discountName;

        return detail;
      }

      function mapDetailsOriginalValues(details){
        return details.map(function(detail){
          detail.originalQuantity = _.clone(detail.quantity);
          return detail;
        });
      }

      function localQuotationUpdate(quotation){
        var quotationAux = {
          totalProducts: 0,
          subtotal: 0,
          total: 0,
          totalPg1: 0,
          totalPg2: 0,
          totalPg3: 0,
          totalPg4: 0,
          totalPg5: 0
        };

        quotationAux = _.reduce(quotation.Details, function(quotationObj,detail){
          quotationObj.totalProducts += detail.quantity;
          quotationObj.subtotal += detail.subtotal;
          quotationObj.total += detail.total;

          quotationObj.totalPg1 += detail.totalPg1;
          quotationObj.totalPg2 += detail.totalPg2;
          quotationObj.totalPg3 += detail.totalPg3;
          quotationObj.totalPg4 += detail.totalPg4;
          quotationObj.totalPg5 += detail.totalPg5;

          return quotationObj;
        }, quotationAux);

        quotation = _.extend(quotation, quotationAux);
        quotation.discount = quotation.total - quotation.subtotal;
        return quotation;
      }

      function localQuotationUpdateWithNewValues(quotation, newValues){
        quotation.total         = newValues.total;
        quotation.subtotal      = newValues.subtotal;
        quotation.discount      = newValues.discount;
        quotation.totalProducts = newValues.totalProducts;   

        return quotation;
      }   

      function adjustSameProductsDeliveriesAndStock(details){
        details = details.map(function(detail){
          var productTakenStock = getProductTakenStockFromRemainingDetails(detail, details);
          var adjustedDetail = substractProductTakenStockFromDetail(
              detail,
              detail.deliveries,
              productTakenStock
            );
          return adjustedDetail;
        });
        return details;
      }

      function getProductTakenStockFromRemainingDetails(currentDetail, allDetails){
        return _.reduce(allDetails, function(takenStock, detail){
          if(detail.Product.id === currentDetail.Product.id && detail.id !== currentDetail.id){
            takenStock += detail.quantity;
          }
          return takenStock;
        },0);
      }

      function substractProductTakenStockFromDetail(detail, deliveries, productTakenStock){
        for(var i = 0; i<deliveries.length; i++){
          deliveries[i].available = deliveries[i].initalAvailable -  productTakenStock;      

          //Avoiding negative values
          if(deliveries[i].available < 0){
            deliveries[i].available = 0;
          }
          
          if(
            areSameDates(detail.shipDate, deliveries[i].date) && 
            deliveries[i].available <= detail.quantity && 
            detail.quantity <= deliveries[i].initalAvailable        
          ){
            console.log('APARTANDO', detail.id);
            deliveries[i].available = _.clone(detail.quantity);        
          }
          
          else if(
            areSameDates(detail.shipDate, deliveries[i].date) && 
            deliveries[i].available <= detail.quantity && 
            detail.quantity > deliveries[i].initalAvailable      
          ){
            //Takinkg what is available at time
            detail.quantity = deliveries[i].available;         
            detail.availabilityChanged = true;               
          }

        }
        
        return deliveryService.setUpDetailDeliveries(detail, deliveries);
      }

      function areSameDates(date1, date2){
        var FORMAT = 'D/M/YYYY';
        var date1Str = moment(date1).format(FORMAT);
        var date2Str = moment(date2).format(FORMAT);    
        return date1Str === date2Str;
      }        

    }


})();