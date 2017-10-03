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
	    apiResourceQuotations: quotationService.getGeneralList,
	    queryClients: queryClients,
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
	      {key:'paymentType', label:'Tipo pago'}  
	    ],    
	  });

	  init();

	  function init(){
	  	var orderStatusMapper = orderService.getOrderStatusMapper();
	  	var sitesMapper = siteService.getStoresIdMapper();

	  	vm.stores = convertMapperToArray(sitesMapper);
	  	vm.orderStatuses = convertMapperToArray(orderStatusMapper);
	  	console.log('vm.stores', vm.stores);
	  	console.log('vm.orderStatuses', vm.orderStatuses);
	  	loadPaymentsTypes();
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
