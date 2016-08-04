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

function ClientsListCtrl($location,$routeParams, $q ,productService, clientService, userService, $rootScope, commonService, quotationService){

  var vm = this;

  vm.applyFilters = applyFilters;

  vm.user = $rootScope.user;
  vm.columnsClients = [
    {key:'CardCode', label:'CardCode'},
    {key:'CardName', label:'Cliente'},
    //{key:'rfc', label:'RFC'},
    {key:'E_Mail', label:'Email'},
    {key:'Phone1', label:'Télefono'},
    {key:'ewallet', label:'Saldo Monedero', currency: true},
    //{key:'alta', label:'Alta'},
    {
      key:'Acciones',
      label:'Acción',
      propId: 'id',
      actions:[
        {url:'/clients/profile/',type:'edit'},
      ]
    },

  ];


  vm.apiResourceClients = clientService.getClients;
  vm.filters = {
    SlpCode: $rootScope.user.SlpCode
  };

  function applyFilters(){
    $rootScope.$broadcast('reloadTable', true);
  }

}
