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
  	$scope,
	  $rootScope,
	  $q,
	  orderService,
	  siteService,
	  clientService,
	  paymentService
 	) {
	  var vm = this;

	  angular.extend(vm,{
	    user: angular.copy($rootScope.user),
	    triggerExportName: 'triggerExport',
	    triggerExcelExport: triggerExcelExport,
	    searchParams: {
	    },
	    dateRange: {
	    	field: 'createdAt'
	    },
	    apiResourceOrders: orderService.getGeneralList,
	    queryClients: queryClients,
	    onClientSelected: onClientSelected,
	    onStartDateSelected: onStartDateSelected,    
	    onEndDateSelected: onEndDateSelected,    
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
	      {key:'Client.E_Mail', label:'Email', defaultValue:'Sin cliente'},		      	      
	      {key:'Store', label: 'Sitio', mapper: siteService.getStoresIdMapper()}      
	    ],

	  });

	  //Uppercase fields dont work on ALASQL, use [] instead, 
	  //for example [Store] instead of Store

    vm.exportQuery = 'SELECT folio AS Folio,';
    vm.exportQuery += 'dateFormat(createdAt) as Fecha,';
    vm.exportQuery += 'currencyFormat(total) as Total,';
    vm.exportQuery += 'currencyFormat(discount) as Descuento,';
    vm.exportQuery += 'orderStatusMapperFormat(status) as Estatus,';
    vm.exportQuery += 'Client->CardName as Cliente,';
    vm.exportQuery += 'Client->E_Mail as Email,';
    vm.exportQuery += 'storeIdMapperFormat([Store]) as Sitio ';
    vm.exportQuery += ' INTO XLS("pedidos.xls",{headers:true}) FROM ?';

	  init();

	  function init(){
	  	var orderStatusMapper = orderService.getOrderStatusMapper();
	  	var sitesMapper = siteService.getStoresIdMapper();

	  	vm.stores = addEverythingOption(convertMapperToArray(sitesMapper));
	  	vm.orderStatuses = addEverythingOption(convertMapperToArray(orderStatusMapper));
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
	  		vm.searchParams.Client  = item.id;
	  	}
	  }

	  function triggerExcelExport(){
	  	$scope.$broadcast(vm.triggerExportName);
	  }

	  $scope.$on('isExporting', function(evt, data){
	  	vm.isExporting = data;
	  });

	  $scope.$watch('vm.selectedClient',function(newVal, oldVal){
	  	if(newVal !== oldVal && newVal){
	  		console.log('newVal', newVal);
	  		vm.searchParams.Client = newVal.id;
	  	}

	  	if(!newVal){
	  		vm.searchParams.Client = 'none';
	  	}
	  });

	  function queryClients(term){
      /*
      var params = {term: term, autocomplete: true};
      return clientService.search(1,params).then(function(res){
        return res.data.data;
      });	
      */    
	    
	    if(term !== '' && term){
	      var params = {term: term, autocomplete: true};
	      return clientService.search(1,params).then(function(res){
	        return res.data.data;
	      });
	    }
	    else{
	      return $q.resolve([]);
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
