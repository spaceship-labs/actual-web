(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('quotationService', quotationService);

    /** @ngInject */
    function quotationService($http, $location, $q, $rootScope, api, Upload, productService, localStorageService){

      var service = {
        addDetail: addDetail,
        addPayment: addPayment,
        addProduct: addProduct,
        addRecord: addRecord,
        addMultipleProducts: addMultipleProducts,
        calculateItemsNumber: calculateItemsNumber,
        calculateSubTotal: calculateSubTotal,
        calculateTotal: calculateTotal,
        calculateTotalDiscount: calculateTotalDiscount,
        create: create,
        getActiveQuotation: getActiveQuotation,
        getByClient: getByClient,
        getById: getById,
        getCountByUser: getCountByUser,
        getList: getList,
        getQuotationProducts: getQuotationProducts,
        getQuotationTotals: getQuotationTotals,
        getRecords: getRecords,
        getTotalByPaymentMethod: getTotalByPaymentMethod,
        getTotalsByUser: getTotalsByUser,
        loadProductFilters: loadProductFilters,
        newQuotation: newQuotation,
        removeDetail: removeDetail,
        setActiveQuotation: setActiveQuotation,
        update: update,
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

      function removeDetail(id, quotationId){
        var url = '/quotation/removedetail/' + id  + '/' + quotationId;
        return api.$http.post(url);
      }

      function getTotalsByUser(userId, params){
        var url = '/quotation/gettotalsbyuser/' + userId;
        return api.$http.post(url,params);
      }

      function getCountByUser(userId, params){
        var url = '/quotation/getcountbyuser/' + userId;
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

      function getQuotationProducts(quotation){
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
          productService.getList(page,params).then(function(res){
            return productService.formatProducts(res.data.data);
          })
          .then(function(fProducts){
            //Match detail - product
            quotation.Details.forEach(function(detail){
              detail.Product = _.findWhere( fProducts, {id : detail.Product } );
            });
            deferred.resolve(quotation.Details);
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

      function setActiveQuotation(quotationId){
        localStorageService.set('quotation', quotationId);
        $rootScope.$broadcast('newActiveQuotation', quotationId);
      }


      function newQuotation(params, goToSearch){
        create(params).then(function(res){
          var quotation = res.data;
          if(quotation){
            setActiveQuotation(quotation.id);
            if(goToSearch){
              $location.path('/').search({startQuotation:true});
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
            quantity: params.quantity,
            Quotation: quotationId
          };
          addDetail(quotationId, detail).then(function(res){
            setActiveQuotation(quotationId);
            $location.path('/quotations/edit/' + quotationId);
          });

        }else{
          //Crear cotizacion con producto agregado
          var params = {
            User: $rootScope.user.id,
            Details:[ {Product: productId, quantity: params.quantity}  ]
          };
          create(params).then(function(res){
            var quotation = res.data;
            if(quotation){
              setActiveQuotation(quotation.id);
              $location.path('/quotations/edit/' + quotation.id);
            }
          });
        }
      }

      //@params: Object products, containing id, quantity
      function addMultipleProducts(products){
        var quotationId = localStorageService.get('quotation');
        if( quotationId ){
          var detailsPromises = [];
          products.forEach(function(p){
            var detail = {
              Product: p.id,
              quantity: p.quantity,
              Quotation: quotationId
            };
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
            Details: products.map(function(p){
              var detail = {
                Product: p.id,
                quantity: p.quantity
              };
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

      function addPayment(quotationId, params){
        var url = '/quotation/addpayment/' + quotationId;
        return api.$http.post(url,params);
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
        console.log('params',params);
        var url = '/quotation/totals/' + quotationId;
        return api.$http.post(url,params);
      }

      function getRecords(quotationId){
        var url = '/quotation/' + quotationId + '/records';
        return api.$http.post(url);
      }

    }


})();
