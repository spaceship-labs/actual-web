(function (){
  'use strict';

  angular
    .module('dashexampleApp')
    .factory('deliveryService', deliveryService);

  function deliveryService(api, $filter){
    var service = {
    	getAvailableByDeliveries: getAvailableByDeliveries,
    	groupDeliveryDates: groupDeliveryDates,
    	groupDetails: groupDetails,
    	sortDeliveriesByHierarchy: sortDeliveriesByHierarchy,
    	substractDeliveriesStockByQuotationDetails: substractDeliveriesStockByQuotationDetails,
    };

    function substractDeliveriesStockByQuotationDetails(details, deliveries, productId){
    	details = details.filter(function(detail){
    		var detailProductId;
    		if(angular.isObject(detail.Product)){
    			detailProductId = detail.Product.id;
    		}else{
    			detailProductId = detail.Product;
    		}
    		return detailProductId === productId;
    	});
    	for(var i = 0; i<deliveries.length; i++){
    		for(var j=0; j<details.length; j++){
    			if(
  					details[j].shipCompany === deliveries[i].company && 
  					details[j].shipCompanyFrom === deliveries[i].companyFrom  					
    			){
    				deliveries[i].available -= details[j].quantity;
    			}
    		}
    	}
    	return deliveries;
    }

    function groupDetails(details){
    	var groups = [];
    	var groupedDetails = _.groupBy(details, function(detail){
    		var discountPercent = detail.discountPercent || 0;
    		var date = moment(detail.shipDate).startOf('day');
    		return detail.Product.ItemCode + '#' + date + discountPercent;
    	});
    	for(var key in groupedDetails){
    		var group = angular.copy(groupedDetails[key][0]);
    	 	group.quantity = 0;
    	 	group.subtotal = 0;
    	 	group.total = 0;
    	 	group.discount = 0;
    	 	group.ewallet = 0;
    	 	for(var i=0; i< groupedDetails[key].length; i++){
    	 		var detail = groupedDetails[key][i];
    	 		group.quantity += detail.quantity;
    	 		group.subtotal += detail.subtotal;
    	 		group.total 	 += detail.total;
    	 		group.discount += detail.discount;
    	 		group.ewallet  += detail.ewallet;
    	 	}
    		group.details = groupedDetails[key];
    	 	var invalidStock = _.findWhere(group.details, {validStock: false});
    	 	group.validStock = invalidStock ? false : true;
    		groups.push(group);
    	}
    	return groups;
    }

    function convertDatetimeToDate(datetime){
    	var date = moment(datetime).startOf('day').toDate();
    	return date;
    }

    function groupDeliveryDates(deliveries){
	    var groups = [];
	    for(var i= (deliveries.length-1); i>= 0; i--){
	    	var items = _.filter(deliveries, function(delivery){
	    		if(delivery.companyFrom !== deliveries[i].companyFrom && 
	    			convertDatetimeToDate(delivery.date) <= convertDatetimeToDate(deliveries[i].date)
	    		){
	    			return true;
	    		}
	    		else{
	    			return false;
	    		}
	    	});
    		items.push(deliveries[i]);
				if(items.length > 0){	    	
					items = $filter('orderBy')(items, 'date');
		    	var farthestDelivery = getFarthestDelivery(items);
		      var group = {
		      	available: getAvailableByDeliveries(items),
		      	days: farthestDelivery.days,
		        deliveries: items,
		        date: farthestDelivery.date
		      };
		      groups.push(group);
		    }
	    }
			groups = _.uniq(groups, false, function(group) {
				return group.date;
			});

	    return groups;
    }

    function getFarthestDelivery(deliveries){
		  var farthestDelivery = {};
		  for(var i=0; i<deliveries.length; i++){
		    if(
		      (
		        farthestDelivery.date && 
		        new Date(deliveries[i].date) >= new Date(farthestDelivery.date)
		      ) || 
		      i === 0
		    ){
		      farthestDelivery = deliveries[i];
		    }
		  }
		  return farthestDelivery;
    }

    function getAvailableByDeliveries(deliveries){
    	var warehousesIds = getWarehousesIdsByDeliveries(deliveries);
      var available = 0;
      available = warehousesIds.reduce(function(acum, whsId) {
        return acum + getDeliveryStockByWarehouse(whsId, deliveries);
      }, 0);
      return available;
    }

    function getDeliveryStockByWarehouse(warehouseId,deliveries){
			var stock = deliveries.reduce(function(acum, delivery) {
        if (delivery.companyFrom === warehouseId &&  delivery.available > acum ){
          return delivery.available;
        }
        return acum;
      }, 0);
      return stock;
    }

    function getWarehousesIdsByDeliveries(deliveries){
      var warehousesIds  = deliveries.reduce(function(warehouses, delivery){
        if (warehouses.indexOf(delivery.companyFrom) === -1) {
          return warehouses.concat(delivery.companyFrom);
        }
        return warehouses;
      }, []); 
      return warehousesIds;  	
    }

    function getCategoriesGroups(){
      var url = '/productcategory/getcategoriesgroups';
      return api.$http.post(url);
    }

	  function sortDeliveriesByHierarchy(deliveries, allWarehouses, activeStoreWarehouse){
	    var sortedDeliveries = [];
	    var warehouses = deliveries.map(function(delivery){
	      var warehouse = _.findWhere(allWarehouses, {
	        id: delivery.companyFrom
	      });
	      return warehouse;
	    });
	    warehouses = sortWarehousesByHierarchy(warehouses, activeStoreWarehouse);
	    for(var i = 0; i < warehouses.length; i++){
	      var delivery = _.findWhere(deliveries, {companyFrom: warehouses[i].id});
	      sortedDeliveries.push( delivery );
	    }

	    sortedDeliveries = sortDeliveriesByDate(sortedDeliveries);

	    return sortedDeliveries;    
	  }

	  function sortWarehousesByHierarchy(warehouses, activeStoreWarehouse){
	    var region = activeStoreWarehouse.region;
	    var sorted = [];
	    var rules  = getWarehousesRules(region, warehouses);
	    
	    for(var i=0;i<rules.length;i++){
	      for(var j=0;j<warehouses.length;j++){
	        var hash = getWarehouseHash(warehouses[j]);
	        if(!warehouses[j].sorted && hash == rules[i]){
	          sorted.push(warehouses[j]);
	          warehouses[j].sorted = true;
	        }
	      }
	    }
	    return sorted;
	  }

	  function sortDeliveriesByDate(deliveries){
	  	var sortedByDate = deliveries.sort(function(a,b){
		    var dateA = new Date(a.date).getTime();
		    var dateB = new Date(b.date).getTime();
		    return dateA < dateB ? 1 : -1;  	  	
	  	});
	  	return sortedByDate;
	  }

	  function getWarehouseHash(warehouse){
	    var hash = warehouse.cedis ? 'cedis#' : '#';
	    hash += warehouse.region;
	    return hash;
	  }

	  function getWarehousesRules(region, warehouses){
	    var otherRegions = warehouses
	      .filter(function(whs){
	        return whs.region != region;
	      })
	      .map(function(whs){
	        return whs.region;
	      });

	    //Hierarchy
	    /*	
				1. Region cedis
				2. Other regions cedis
				3. Region warehouses
				4. Other regions warehouses
	    */
	    var otherRegionsRules = [];
	    var rulesHashes = [
	      'cedis#' + region,
	    ];
	    if(otherRegions.length > 0){
	      for(var i=0;i<otherRegions.length;i++){
	        rulesHashes.push('cedis#'+otherRegions[i]);
	        otherRegionsRules.push('#'+otherRegions[i]);
				}
	    }
	    rulesHashes.push('#'+region);
	    rulesHashes = rulesHashes.concat(otherRegionsRules);
	    return rulesHashes;
	  }

    return service;

  }

})();
