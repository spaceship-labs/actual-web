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
	  siteService
  ) {

	  var vm = this;
	  angular.extend(vm,{
	    user: angular.copy($rootScope.user),
	    apiResourceQuotations: quotationService.getGeneralList,
	    clientSearch: true, 
	    defaultSort: [1, "desc"], //created at    
	    columnsQuotations: [
	      {key: 'folio', label:'Folio'},
	      {key:'createdAt', label:'Fecha' ,date:true},
	      {key:'discount', label:'Descuento', currency:true},
	      {key:'total', label: 'Total', currency:true},    
	      {key:'Client.CardName', label:'Cliente', defaultValue:'Sin cliente'},
	      {key:'Client.E_Mail', label:'Email', defaultValue:'Sin cliente'},		      
	      {key:'Store', label: 'Sitio', mapper: siteService.getStoresIdMapper()},      
	      {
	        key:'Acciones',
	        label:'Acciones',
	        propId: 'id',
	        domainMapper:siteService.getStoresIdMapper(),
	        domainColumn: 'Store',	        
	        actions:[
	          {url:'/quotations/edit/',type:'edit'},
	        ]
	      },
	    ],    
	  });

	  init();

	  function init(){
	  }

  });
