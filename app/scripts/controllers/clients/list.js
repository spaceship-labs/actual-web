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

function ClientsListCtrl($location,$routeParams, $q ,productService, clientService, userService, $rootScope, commonService){

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
  vm.apiResourceClients = clientService.getClients;
  vm.filters = {
    SlpCode: $rootScope.user.SlpCode
  };

  console.log($rootScope.user);


}
