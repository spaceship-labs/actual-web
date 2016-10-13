(function (){
  'use strict';

  angular
    .module('dashexampleApp')
    .factory('deliveryService', deliveryService);

  function deliveryService(api, $filter){
    var service = {
    	getAvailableByDeliveries: getAvailableByDeliveries,
    	groupDeliveryDates: groupDeliveryDates,
    	groupDeliveryDates2: groupDeliveryDates2,
    	groupDetails: groupDetails,
    	sortDeliveriesByHierarchy: sortDeliveriesByHierarchy,
    	substractDeliveriesStockByDetails: substractDeliveriesStockByDetails
    };

    function substractDeliveriesStockByDetails(details, deliveries, productId){
    	details = details.filter(function(detail){
    		return detail.Product === productId || detail.Product.id === productId;
    	});
    	for(var i = 0; i<deliveries.length; i++){
    		for(var j=0; j<details.length; j++){
    			var detailShipDate = moment(details[j].shipDate).startOf('day').format('DD-MM-YYYY');
    			var deliveryDate = moment(deliveries[i].date).startOf('day').format('DD-MM-YYYY');
    			if(
    				detailShipDate === deliveryDate &&
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
    	 		group.total += detail.total;
    	 		group.discount += detail.discount;
    	 		group.ewallet += detail.ewallet;
    	 	}
    		group.details = groupedDetails[key];
    		groups.push(group);
    	}
    	return groups;
    }

    function groupDeliveryDates(deliveries){
	    var groups = [];
	    for(var i= (deliveries.length-1); i>= 0; i--){
	    	var items = _.filter(deliveries, function(delivery){
	    		if(delivery.companyFrom !== deliveries[i].companyFrom && 
	    			new Date(delivery.date) <= new Date(deliveries[i].date)
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

	  function groupDeliveryDates2(deliveries){
	    var groups = [];
	    for(var i=0;i<deliveries.length;i++){
	      var items = _.where(deliveries, {
	        date: deliveries[i].date,
	        available: deliveries[i].available
	      });
	      var group = {
	        days: deliveries[i].days,
	        date: deliveries[i].date,
	        hash: deliveries[i].date + '#' + deliveries[i].available,
	        deliveries: items,
	      };
	      groups.push(group);
	    }
	    groups = _.uniq(groups, false, function(g){
	      return g.hash;
	    });
	    groups = groups.map(function(g){
	      g.available = g.deliveries.reduce(function(acum, delivery){
	        acum+= delivery.available;
	        return acum;
	      }, 0);
	      return g;
	    });
	    return groups;
	    //return deliveries;
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
