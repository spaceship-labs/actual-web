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

function ClientsListCtrl($location,$routeParams, $q ,productService, $rootScope, commonService){

  var vm = this;

  vm.columnsClients = [
    {key:'id', label:'id'},
    {key:'client', label:'Cliente'},
    {key:'rfc', label:'RFC'},
    {key:'email', label:'Email'},
    {key:'telefono', label:'Télefono'},
    {key:'alta', label:'Alta'},
    {
      key:'Acciones',
      label:'Acción',
      propId: 'id',
      actions:[
        {url:'#',type:'edit'},
      ]
    },

  ];
  vm.apiResourceClients = commonService.simulateClients;



}
