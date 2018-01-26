'use strict';
angular.module('actualWebApp')
  .service('gtmService', function () {
    var service = {
        notifyAddToCart: notifyAddToCart,
        notifiyOrder: notifiyOrder
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

    function notifiyOrder(folio, amount, zipcode){
        console.log('notifyAddToCart', sku);
        var dataLayer = window.dataLayer = window.dataLayer || [];
        console.log('dataLayer', dataLayer);
        dataLayer.push({
            event: 'addToCartEvent',
            attributes:{
                folio: folio,
                amount: amount,
                zipcode: zipcode
            }
        });        
    }

    return service;
  });
