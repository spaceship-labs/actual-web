'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:UsersUserPurchasesCtrl
 * @description
 * # UsersUserPurchasesCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('UsersUserPurchasesCtrl', UsersUserPurchasesCtrl);

function UsersUserPurchasesCtrl(
  $rootScope,
  orderService
){
  var vm = this;

  angular.extend(vm,{
    user: angular.copy($rootScope.user),
    apiResourceOrders: orderService.getList,    
    defaultSort: [1, "desc"], //created at
    columnsOrders: [
      {key: 'folio', label:'Folio'},
      {key:'createdAt', label:'Fecha' ,date:true},
      {key:'discount', label:'Descuento', currency:true},
      {key:'total', label: 'Total', currency:true},      
      {key:'status', label:'Estatus', mapper:orderService.getOrderStatusMapper()},
      {
        key:'Acciones',
        label:'Acciones',
        propId: 'id',
        actions:[
          {url:'/checkout/order/',type:'edit'},
        ]
      },
    ],    
  });

  init();

  function init(){
  }

}