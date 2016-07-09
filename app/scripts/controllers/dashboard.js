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

function DashboardCtrl($routeParams , $rootScope,categoriesService, productService, quotationService){
  var vm = this;

  vm.getQuotationData = getQuotationData;
  vm.init = init;

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

  function getQuotationData(){
    quotationService.getTotalsByUser($rootScope.user.id, {}).then(function(res){
      console.log(res);
      vm.quotationData.todayAmmount = res.data.all[0].total;
      vm.quotationData.monthAmmount = res.data.all[0].total + 10000;
      console.log(vm.quotationData);
      vm.quotationData.ammounts = {
        labels: ["Hoy", "Resto del mes"],
        data: [vm.quotationData.todayAmmount, (vm.quotationData.monthAmmount - vm.quotationData.todayAmmount) ],
        colours: ["#C92933", "#48C7DB", "#FFCE56"]
      };
    });
    quotationService.getCountByUser($rootScope.user.id, {}).then(function(res){
      console.log(res);
      vm.quotationData.todayQty = res.data.all;
      vm.quotationData.monthQty = res.data.dateRange;
      vm.quotationData.quantities = {
        labels: ["Hoy", "Resto del mes"],
        data: [vm.quotationData.todayQty, (vm.quotationData.monthQty - vm.quotationData.todayQty) ],
        colours: ["#C92933", "#48C7DB", "#FFCE56"]
      };
    });
  }

  function init(){
    vm.getQuotationData();
  }

  vm.init();

}
