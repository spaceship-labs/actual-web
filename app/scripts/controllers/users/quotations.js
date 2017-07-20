'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:UsersUserQuotationsCtrl
 * @description
 * # UsersUserQuotationsCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('UsersUserQuotationsCtrl', UsersUserQuotationsCtrl);

function UsersUserQuotationsCtrl(
  $rootScope,
  quotationService,
  siteService
){
  var vm = this;
  angular.extend(vm,{
    user: angular.copy($rootScope.user),
    apiResourceQuotations: quotationService.getList,    
    defaultSort: [1, "desc"], //created at    
    columnsQuotations: [
      {key: 'folio', label:'Folio'},
      {key:'createdAt', label:'Fecha' ,date:true},
      {key:'discount', label:'Descuento', currency:true},
      {key:'total', label: 'Total', currency:true},    
      {key:'Store', label: 'Sitio', mapper: siteService.getStoresIdMapper()},      
      {
        key:'Acciones',
        label:'Acciones',
        propId: 'id',
        actions:[
          {url:'/quotations/edit/',type:'edit'},
        ]
      },
    ],    
  });

  init();

  function init(){
  }

}