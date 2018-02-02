'use strict';
angular.module('actualWebApp')
  .service('gtmService', function () {
    var service = {
        notifyAddToCart: notifyAddToCart,
        notifyOrder: notifyOrder
    };

    function notifyAddToCart(sku, quantity, amount, zipcode){
        console.log('notifyAddToCart', sku);
        var dataLayer = window.dataLayer = window.dataLayer || [];
        console.log('dataLayer', dataLayer);
        dataLayer.push({
            event: 'addToCartEvent',
            attributes:{
                quantity: quantity,
                sku: sku,
                amount: amount,
                zipcode: zipcode
            }
        });
    }

    function notifyOrder(params){
        console.log('orderEvent');
        var dataLayer = window.dataLayer = window.dataLayer || [];
        console.log('dataLayer', dataLayer);
        dataLayer.push({
            event: 'orderEvent',
            attributes:{
                folio: params.folio,
                total: params.total,
                client: params.client,
                zipcode: params.zipcode
            }
        });
        console.log('datalayer after', dataLayer);
    }

    return service;
  });
