'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:ClientsListCtrl
 * @description
 * # ClientsListCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('ClientsListCtrl', ClientsListCtrl);

function ClientsListCtrl($location,$routeParams, $q ,productService, userService, $rootScope, commonService){

  var vm = this;

  vm.columnsClients = [
    {key:'CardCode', label:'CardCode'},
    {key:'CardName', label:'Cliente'},
    //{key:'rfc', label:'RFC'},
    {key:'E_Mail', label:'Email'},
    {key:'Phone1', label:'Télefono'},
    //{key:'alta', label:'Alta'},
    {
      key:'Acciones',
      label:'Acción',
      propId: 'CardCode',
      actions:[
        {url:'/clients/profile/',type:'edit'},
      ]
    },

  ];
  vm.apiResourceClients = userService.getClients;
  vm.init = init;

  console.log($rootScope.user);

  function init(){
    userService.getClients(1,{}).then(function(res){
      console.log(res);
    });
  }

  vm.init();

}
