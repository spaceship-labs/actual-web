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
	  siteService
 	) {
	  var vm = this;

	  angular.extend(vm,{
	    user: angular.copy($rootScope.user),
	    apiResourceOrders: orderService.getGeneralList,    
	    clientSearch: true,
	    defaultSort: [1, "desc"], //created at
	    columnsOrders: [
	      {key: 'folio', label:'Folio'},
	      {key:'createdAt', label:'Fecha' ,date:true},
	      {key:'discount', label:'Descuento', currency:true},
	      {key:'total', label: 'Total', currency:true},      
	      {key:'status', label:'Estatus', mapper:orderService.getOrderStatusMapper()},
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
	          {
	            url:'/checkout/order/',
	            type:'edit',
	          },
	        ]
	      },
	    ],    
	  });

	  init();

	  function init(){
	  }

  });
