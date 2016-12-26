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
        addRecord: addRecord,
        addMultipleProducts: addMultipleProducts,
        calculateItemsNumber: calculateItemsNumber,
        calculateSubTotal: calculateSubTotal,
        calculateTotal: calculateTotal,
        calculateTotalDiscount: calculateTotalDiscount,
        closeQuotation: closeQuotation,
        create: create,
        isValidStock: isValidStock,
        getActiveQuotation: getActiveQuotation,
        getActiveQuotationId: getActiveQuotationId,
        getByClient: getByClient,
        getById: getById,
        getCountByUser: getCountByUser,
        getList: getList,
        populateDetailsWithProducts: populateDetailsWithProducts,
        getQuotationTotals: getQuotationTotals,
        getCurrentStock: getCurrentStock,        
        getRecords: getRecords,
        getTotalByPaymentMethod: getTotalByPaymentMethod,
        getTotalsByUser: getTotalsByUser,
        getClosingReasons: getClosingReasons,
        getPaymentOptions: getPaymentOptions,
        getRecordTypes: getRecordTypes,
        loadProductFilters: loadProductFilters,
        newQuotation: newQuotation,
        mapDetailsStock: mapDetailsStock,
        removeDetail: removeDetail,
        removeDetailsGroup: removeDetailsGroup,
        removeCurrentQuotation: removeCurrentQuotation,
        setActiveQuotation: setActiveQuotation,
        sendByEmail: sendByEmail,
        showStockAlert: showStockAlert,
        update: update,
        updateSource: updateSource,
        updateBroker: updateBroker,
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

      function updateSource(id, params){
        var url = '/quotation/' + id + '/source';
        return api.$http.post(url, params);
      }

      function updateBroker(id, params){
        var url = '/quotation/' + id + '/broker';
        return api.$http.post(url, params);
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
        return api.$http.post(url, params);
      }

      function removeDetail(id, quotationId){
        var url = '/quotation/removedetail/' + id  + '/' + quotationId;
        return api.$http.post(url);
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

      function calculateSubTotal(quotation){
        var subTotal = 0;
        if(quotation.Details){
          var details = quotation.Details;
          details.forEach(function(detail){
            if(detail.Product && detail.Product.priceBefore){
              subTotal+= detail.Product.priceBefore * detail.quantity;
            }
          });
        }
        return subTotal;

      }

      function calculateTotal(quotation){
        var total = 0;
        if(quotation.Details){
          var details = quotation.Details;
          details.forEach(function(detail){
            if(detail.Product && detail.Product.Price){
              total+= detail.Product.Price * detail.quantity;
            }
          });
        }
        return total;
      }

      //Siempre toma el precio actual como la promocion con pago unico
      function calculateTotalDiscount(quotation){
        var totalDiscount = 0;
        if(quotation.Details){
          var details = quotation.Details;
          details.forEach(function(detail){
            if(detail.Product && detail.Product.Price && detail.Product.priceBefore){
              totalDiscount += ( detail.Product.priceBefore - detail.Product.Price) * detail.quantity;
            }
          });
        }
        return totalDiscount;
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

      function calculateItemsNumber(quotation){
        var items = 0;
        if(quotation.Details){
          var details = quotation.Details;
          details.forEach(function(detail){
            items += detail.quantity;
          });
        }
        return items;
      }

      function populateDetailsWithProducts(quotation){
        var deferred = $q.defer();
        var productsIds = [];
        if(quotation){
          quotation.Details.forEach(function(detail){
            productsIds.push(detail.Product);
          });
          var params = {
            filters: {id: productsIds},
            populate_fields: ['FilterValues','Promotions']
          };
          var page = 1;
          productService.getList(page,params)
            .then(function(res){
              return productService.formatProducts(res.data.data);
            })
            .then(function(fProducts){
              //Match detail - product
              quotation.Details.forEach(function(detail){
                detail.Product = _.findWhere( fProducts, {id : detail.Product } );
              });
              deferred.resolve(quotation.Details);
            })
            .catch(function(err){
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
        if(!quotationId){
          deferred.resolve(false);
          return deferred.promise;
        }
        return getById(quotationId);
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

      function newQuotation(params, goToSearch){
        create(params).then(function(res){
          var quotation = res.data;
          if(quotation){
            setActiveQuotation(quotation.id);
            if(goToSearch){
              $location.path('/').search({startQuotation:true});
            }else{
              $location.path('/quotations/edit/'+quotation.id)
                .search({startQuotation:true});
            }
          }
        });
      }

      function createDetailFromParams(productId, params, quotationId){
        var detail = {
          Product: productId,
          quantity: params.quantity,
          Quotation: quotationId,
          shipDate: params.shipDate,
          productDate: params.productDate,
          shipCompany: params.shipCompany,
          shipCompanyFrom: params.shipCompanyFrom,
          PromotionPackage: params.promotionPackage || null
        };
        if(quotationId){
          detail.Quotation = quotationId;
        }
        return detail;
      }

      function addProduct(productId, params){
        var quotationId = localStorageService.get('quotation');
        var detail = createDetailFromParams(productId, params, quotationId);
        if( quotationId ){
          //Agregar al carrito
          addDetail(quotationId, detail)
            .then(function(res){
              setActiveQuotation(quotationId);
              $location.path('/quotations/edit/' + quotationId);
            })
            .catch(function(err){
              console.log(err);
            })

        }else{
          //Crear cotizacion con producto agregado
          var params = {
            User: $rootScope.user.id,
            Details: [detail]
          };
          create(params).then(function(res){
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
      function addMultipleProducts(products){
        var quotationId = localStorageService.get('quotation');
        if( quotationId ){
          var detailsPromises = [];
          products.forEach(function(product){
            var detail = createDetailFromParams(product.id, product, quotationId);
            detailsPromises.push(addDetail(quotationId, detail));
          });
          $q.all(detailsPromises)
            .then(function(details){
              setActiveQuotation(quotationId);
              $location.path('/quotations/edit/' + quotationId);
            })
            .catch(function(err){
              console.log(err);
            });

        }else{
          //Crear cotizacion con producto agregado
          var params = {
            User: $rootScope.user.id,
            Details: products.map(function(product){
              var detail = createDetailFromParams(product.id, product);
              return detail;
            })
          };
          
          create(params).then(function(res){
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

      function loadProductFilters(details){
        var deferred = $q.defer();
        productService.getAllFilters({quickread:true}).then(function(res){
          //Assign filters to every product
          var filters = res.data;
          details.forEach(function(detail){
            filters = filters.map(function(filter){
              filter.Values = [];
              detail.Product.FilterValues.forEach(function(value){
                if(value.Filter === filter.id){
                  filter.Values.push(value);
                }
              });
              return filter;
            });

            filters = filters.filter(function(filter){
              return filter.Values.length > 0;
            });
            detail.Product.Filters = filters;
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

      function getPaymentOptions(id){
        var url = '/quotation/'+id+'/paymentoptions';
        return api.$http.post(url);
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

      function getClosingReasons(){
        var closingReasons = [
          'Cliente compró en otra tienda de la empresa.',
          'Cliente compró en otra mueblería.',
          'Cliente se murió',
          'Cliente solicita no ser contactado más',
          'Cliente ya no está interesado',
          'Cliente es incontactable',
          'Cliente se mudó',
          'Vendedor no dio seguimiento suficiente',
          'Vendedor cotizó artículos equivocados',
          'Los precios son altos',
          'Las fechas de entrega son tardadas',
          'No vendemos el articulo solicitado',
          'Otra razón (especificar)',        
        ];
        return closingReasons;
      }

      function getRecordTypes(){
        var recordTypes = [
          'Email',
          'Llamada', 
          'WhatsApp', 
          'Visita'
        ];
        return recordTypes;
      }

      function showStockAlert(){
        var msg = 'Hay un cambio de disponibilidad en uno o más de tus articulos';
        dialogService.showDialog(msg);        
      }      

    }


})();
