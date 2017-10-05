'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:ReportsQuotationsCtrl
 * @description
 * # ReportsQuotationsCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('ReportsQuotationsCtrl', function (
  	$scope,
	  $rootScope,
	  quotationService,
	  siteService,
	  orderService,
	  paymentService,
	  clientService
  ) {

	  var vm = this;
	  angular.extend(vm,{
	    user: angular.copy($rootScope.user),
	    queryClients: queryClients,
	    triggerExportName: 'triggerExport',
	    triggerExcelExport: triggerExcelExport,
	    searchParams: {
	    },
	    dateRange: {
	    	field: 'createdAt'
	    },	    
	    apiResourceQuotations: quotationService.getGeneralList,
	    onStartDateSelected: onStartDateSelected,    
	    onEndDateSelected: onEndDateSelected,  	    
	    clientSearch: true, 
	    defaultSort: [1, "desc"], //created at    
	    columnsQuotations: [
	      {
	      	key: 'folio', 
	      	label:'Folio',
	      	actionUrl:'/quotations/edit/',
	        domainMapper:siteService.getStoresIdMapper(),
	        domainColumn: 'Store'	      	
	    	},
	      {key:'createdAt', label:'Fecha' ,date:true},
	      {key:'discount', label:'Descuento', currency:true},
	      {key:'total', label: 'Total', currency:true},    
	      {key:'Client.CardName', label:'Cliente', defaultValue:'Sin cliente'},
	      {key:'Client.E_Mail', label:'Email', defaultValue:'Sin cliente'},		      
	      {key:'Store', label: 'Sitio', mapper: siteService.getStoresIdMapper()},
	      {key:'paymentType', label:'Tipo pago'},
	      {key:'OrderWeb', label: 'OrderWeb'}  
	    ],    
	  });

    vm.exportQuery = 'SELECT folio AS Folio,';
    vm.exportQuery += 'dateFormat(createdAt) as Fecha,';
    vm.exportQuery += 'currencyFormat(total) as Total,';
    vm.exportQuery += 'currencyFormat(discount) as Descuento,';
    vm.exportQuery += 'Client->CardName as Cliente,';
    vm.exportQuery += 'Client->E_Mail as Email,';
    vm.exportQuery += 'storeIdMapperFormat([Store]) as Sitio ';
    vm.exportQuery += ' INTO XLS("Cotizaciones.xls",{headers:true}) FROM ?';

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

	  function onStartDateSelected(pikaday){
	  	vm.dateRange.start = pikaday._d;
	  }

	  function onEndDateSelected(pikaday){
	  	vm.dateRange.end = pikaday._d;
	  }

	  function loadPaymentsTypes(){
	  	paymentService.getPaymentsTypes()
	  		.then(function(types){
	  			var mapper = paymentService.getPaymentsTypesMapper();
	  			vm.paymentTypes = convertMapperToArray(mapper)
	  				.filter(function(type){
	  					return types.indexOf(type.value) > -1;
	  				});
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
