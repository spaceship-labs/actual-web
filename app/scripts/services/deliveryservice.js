(function (){
  'use strict';

  angular
    .module('dashexampleApp')
    .factory('deliveryService', deliveryService);

  function deliveryService(api, $filter){
    var service = {
    	getAvailableByDeliveries: getAvailableByDeliveries,
    	groupDeliveryDates: groupDeliveryDates,
    	sortDeliveriesByHierarchy: sortDeliveriesByHierarchy,
    };

	  function groupDeliveryDates(deliveries){
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
    	deliveries = $filter('orderBy')(deliveries, 'date');
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

	  function sortDeliveriesByHierarchy(deliveries){
	    var sortedDeliveries = [];
	    var warehouses = deliveries.map(function(delivery){
	      var warehouse = _.findWhere(vm.warehouses, {
	        id: delivery.companyFrom
	      });
	      return warehouse;
	    });
	    warehouses = sortWarehousesByHierarchy(warehouses);
	    for(var i = 0; i < warehouses.length; i++){
	      var delivery = _.findWhere(deliveries, {companyFrom: warehouses[i].id});
	      sortedDeliveries.push( delivery );
	    }
	    return sortedDeliveries;    
	  }

	  function sortWarehousesByHierarchy(warehouses){
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
	    var rulesHashes = [
	      'cedis#' + region,
	      '#'+region,
	    ];
	    if(otherRegions.length > 0){
	      for(var i=0;i<otherRegions.length;i++){
	        rulesHashes.push('cedis#'+otherRegions[i]);
	        rulesHashes.push('#'+otherRegions[i])
	      }
	    }
	    return rulesHashes;
	  }    

    return service;

  }

})();
