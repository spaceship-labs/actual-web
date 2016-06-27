'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:DashboardCtrl
 * @description
 * # DashboardCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('DashboardCtrl', DashboardCtrl);

function DashboardCtrl($routeParams ,categoriesService, productService){
  var vm = this;

  vm.quotationData = {
    todayQty:5,
    monthQty:20,
    todayAmmount: 38542,
    monthAmmount: 257982,
  };

  vm.quotationData.quantities = {
    labels: ["Hoy", "Resto del mes"],
    data: [vm.quotationData.todayQty, (vm.quotationData.monthQty - vm.quotationData.todayQty) ],
    colours: ["#C92933", "#48C7DB", "#FFCE56"]
  };

  vm.quotationData.ammounts = {
    labels: ["Hoy", "Resto del mes"],
    data: [vm.quotationData.todayAmmount, (vm.quotationData.monthAmmount - vm.quotationData.todayAmmount) ],
    colours: ["#C92933", "#48C7DB", "#FFCE56"]
  };

}
