(function (){
  'use strict';

  angular
    .module('dashexampleApp')
    .factory('cartService', cartService);

  function cartService(
  	$rootScope, 
  	$location,
  	localStorageService, 
  	quotationService,
  	deliveryService
  ){
    var service = {    
      buildAddProductToCartParams: buildAddProductToCartParams,
    	getProductCartItems: getProductCartItems,
			resetProductCartQuantity: resetProductCartQuantity    	
    };

    function buildAddProductToCartParams(productId, cartItem){
      var params = {
        id: productId,
        quantity: cartItem.quantity,
        shipDate: cartItem.date,
        originalShipDate: cartItem.originalDate,
        productDate: cartItem.productDate,
        shipCompany: cartItem.company,
        shipCompanyFrom: cartItem.companyFrom
      };
      return params;
    }    

	  function resetProductCartQuantity(productCart){
	    var available = productCart.deliveryGroup.available;
	    if(productCart.quantity >= available){
	      productCart.quantity = available;
	    }
	    else if(!productCart.quantity && available){
	      productCart.quantity = 1;
	    }
	    return productCart;
	  }

	  function getProductCartItems(deliveryGroup, quantity, warehouses, activeStoreWarehouse){
	    var productCartItems = [];
	     if(deliveryGroup.deliveries.length === 1){
	      var productCartItem = deliveryGroup.deliveries[0];
	      console.log('productCartItem')
	      productCartItem.quantity = quantity;
	      productCartItem.originalDate = productCartItem.date;
	      productCartItems.push( productCartItem );
	    }else{
	      var deliveries = deliveryService.sortDeliveriesByHierarchy(
	        deliveryGroup.deliveries, 
	        warehouses,
	        activeStoreWarehouse
	      );
	      
	      var farthestShipDate = deliveries[0].date;

	      productCartItems = deliveries.map(function(delivery){
	        if(quantity > delivery.available){
	          delivery.quantity = delivery.available;
	          quantity -= delivery.available;
	        }else{
	          delivery.quantity = quantity;
	          quantity = 0;
	        }
	        return delivery;
	      });

	      productCartItems = productCartItems.filter(function(item){
	        return item.quantity > 0;
	      });

	      //Setting farthest delivery date in every productCartItem
	      productCartItems = formatProductCartItems(productCartItems, {date: farthestShipDate});

	    } 
	    return productCartItems;
	  }

	  function formatProductCartItem(){}

	  function formatProductCartItems(productCartItems, defaults){
	  	defaults = defaults || {};
	  	productCartItems = productCartItems.map(function(item){
	  		item.originalDate = angular.copy(item.date);
	  		if(defaults.date){
	  			item.date = defaults.date;
	  		}
	  		return item;
	  	});
	  	return productCartItems;
	  }

    return service;


  }

})();
