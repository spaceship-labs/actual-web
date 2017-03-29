'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:UsersUserInvoicesCtrl
 * @description
 * # UsersUserInvoicesCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('UsersUserInvoicesCtrl', UsersUserInvoicesCtrl);

function UsersUserInvoicesCtrl(
  $rootScope,
  orderService,
  commonService
){
  var vm = this;
  angular.extend(vm,{
    user: angular.copy($rootScope.user),
    apiResourceOrders: orderService.getList,
    columnsOrders: [
      {key: 'folio', label:'Pedido'},
      {key:'createdAt', label:'Fecha del pedido', date:true},
      {key:'total', label: 'Monto', currency:true},
      {key:'total', label: 'Monto facturado', currency:true},
      {key:'invoice.id', label: 'Folio factura'},
      {
        key:'Acciones',
        label:'Acceder',
        actions:[
          {url:'#',type:'edit'},
        ]
      },
    ]
  });

  init();

  function init(){
    getStates();
  }

  function getStates(){
    commonService.getStatesSap()
      .then(function(res){
        console.log(res);
        vm.states = res.data;
      })
      .catch(function(err){
        console.log(err);
      });
  }

}