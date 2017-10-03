'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:ReportsOrdersCtrl
 * @description
 * # ReportsOrdersCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('ReportsOrdersCtrl', function (
	  $rootScope,
	  orderService,
	  siteService,
	  clientService,
	  paymentService
 	) {
	  var vm = this;

	  angular.extend(vm,{
	    user: angular.copy($rootScope.user),
	    searchParams: {},
	    dateRange: {
	    	field: 'createdAt'
	    },
	    apiResourceOrders: orderService.getGeneralList,
	    queryClients: queryClients,
	    onClientSelected: onClientSelected,
	    onStartDateSelected: onStartDateSelected,    
	    onEndDateSelected: onEndDateSelected,    
	    clientSearch: true,
	    defaultSort: [1, "desc"], //created at
	    columnsOrders: [
	      {
	      	key: 'folio', 
	      	label:'Folio',
	      	actionUrl:'/checkout/order/',
	        domainMapper:siteService.getStoresIdMapper(),
	        domainColumn: 'Store'	      	
	    	},
	      {key:'createdAt', label:'Fecha' ,date:true},
	      {key:'discount', label:'Descuento', currency:true},
	      {key:'total', label: 'Total', currency:true},      
	      {key:'status', label:'Estatus', mapper:orderService.getOrderStatusMapper()},
	      {key:'Client.CardName', label:'Cliente', defaultValue:'Sin cliente'},
	      {key:'arrayClient.E_Mail', label:'Email', defaultValue:'Sin cliente'},		      	      
	      {key:'Store', label: 'Sitio', mapper: siteService.getStoresIdMapper()}      
	    ],    
	  });

	  init();

	  function init(){
	  	var orderStatusMapper = orderService.getOrderStatusMapper();
	  	var sitesMapper = siteService.getStoresIdMapper();

	  	vm.stores = addEverythingOption(convertMapperToArray(sitesMapper));
	  	vm.orderStatuses = addEverythingOption(convertMapperToArray(orderStatusMapper));
	  	console.log('vm.stores', vm.stores);
	  	console.log('vm.orderStatuses', vm.orderStatuses);
	  	loadPaymentsTypes();
	  }

	  function addEverythingOption(items){
	  	items.unshift({
	  		label: 'Cualquiera',
	  		value: 'none'
	  	});
	  	return items;
	  }

	  function onStartDateSelected(pikaday){
	  	vm.dateRange.start = pikaday._d;
	  }

	  function onEndDateSelected(pikaday){
	  	vm.dateRange.end = pikaday._d;
	  }

	  function onClientSelected(item){
	  	console.log('item', item);
	  	if(item && item.id){
	  		vm.searchParams.clientId  = item.id;
	  	}
	  }

	  function queryClients(term){
	    if(term !== '' && term){
	      var params = {term: term, autocomplete: true};
	      return clientService.search(1,params).then(function(res){
	        return res.data.data;
	      });
	    }
	    else{
	      return [];
	    }
	  }

	  function loadPaymentsTypes(){
	  	paymentService.getPaymentsTypes()
	  		.then(function(types){
	  			var mapper = paymentService.getPaymentsTypesMapper();
	  			vm.paymentTypes = convertMapperToArray(mapper)
	  				.filter(function(type){
	  					return types.indexOf(type.value) > -1;
	  				});
	  			vm.paymentTypes = addEverythingOption(vm.paymentTypes);
	  			console.log('paymentTypes',vm.paymentTypes);
	  		});
	  }

	  function convertMapperToArray(mapper){
	  	var storesArray = [];
	  	for(var key in mapper){
	  		storesArray.push({
	  			label: mapper[key],
	  			value: key
	  		});
	  	}
	  	return storesArray;
	  }

  });
