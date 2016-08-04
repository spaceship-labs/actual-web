'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:CommissionsListCtrl
 * @description
 * # CommissionsListCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('CommissionsListCtrl', CommissionsListCtrl);

function CommissionsListCtrl($location) {
  var vm     = this;
  vm.columns = [
    {key: 'id', label:'FOLIO'},
    {key: 'createdAt' , label: 'FECHA VENTA'    },
    {key: 'ammount'   , label: 'MONTO COBRADO'  },
    {key: 'commission', label: '% COMISIÓN'     },
    {key: 'commission', label: 'MONTO COMISIÓN' },
    {key: 'commission', label: 'COMISIÓN PAGADA'},
  ];
  vm.apiResourceClients = function() {
    return {
      then: function(fn) {
        fn({data: {data: [], total: 10}});
      }
    };
  }
}
