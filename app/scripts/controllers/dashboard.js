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

function DashboardCtrl($rootScope, $filter, orderService, quotationService){
  var vm = this;

  vm.getQuotationsData = getQuotationsData;
  vm.getOrdersData = getOrdersData;
  vm.init = init;

  vm.quotationsData = {}
  vm.ordersData = {}

  function getQuotationsData(){
    var dateRange = {
      startDate: moment().startOf('day'),
      endDate: moment().endOf('day'),
    };
    quotationService.getTotalsByUser($rootScope.user.id, dateRange)
      .then(function(res){
        vm.quotationsData.todayAmmount = res.data.dateRange;
        vm.quotationsData.monthAmmount = res.data.all;
        vm.quotationsData.ammounts = {
          labels: ["Hoy", "Resto del mes"],
          data: [
            vm.quotationsData.todayAmmount,
            (vm.quotationsData.monthAmmount - vm.quotationsData.todayAmmount)
          ],
          colors: ["#C92933", "#48C7DB", "#FFCE56"],
          options:{
            tooltips: {
              callbacks: {
                label: function(tooltipItem, data) {
                  return $filter('currency')(data.datasets[0].data[tooltipItem.index]);
                }
              }
            }
          },
        };
      });

    quotationService.getCountByUser($rootScope.user.id, dateRange)
      .then(function(res){
        vm.quotationsData.todayQty = res.data.dateRange;
        vm.quotationsData.monthQty = res.data.all;
        vm.quotationsData.quantities = {
          labels: ["Hoy", "Resto del mes"],
          data: [
            vm.quotationsData.todayQty,
            (vm.quotationsData.monthQty - vm.quotationsData.todayQty)
          ],
          colors: ["#C92933", "#48C7DB", "#FFCE56"]
        };
      });
  }

  function getOrdersData(){
    var dateRange = {
      startDate: moment().startOf('day'),
      endDate: moment().endOf('day'),
    };
    orderService.getTotalsByUser($rootScope.user.id, dateRange)
      .then(function(res){
        vm.ordersData.todayAmmount = res.data.dateRange;
        vm.ordersData.monthAmmount = res.data.all;
        vm.ordersData.ammounts = {
          labels: ["Hoy", "Resto del mes"],
          data: [
            vm.ordersData.todayAmmount,
            (vm.ordersData.monthAmmount - vm.ordersData.todayAmmount)
          ],
          colors: ["#C92933", "#48C7DB", "#FFCE56"],
          options:{
            tooltips: {
              callbacks: {
                label: function(tooltipItem, data) {
                  return $filter('currency')(data.datasets[0].data[tooltipItem.index]);
                }
              }
            }
          },
        };
      });

    orderService.getCountByUser($rootScope.user.id, dateRange)
      .then(function(res){
        vm.ordersData.todayQty = res.data.dateRange;
        vm.ordersData.monthQty = res.data.all;
        vm.ordersData.quantities = {
          labels: ["Hoy", "Resto del mes"],
          data: [
            vm.ordersData.todayQty,
            (vm.ordersData.monthQty - vm.ordersData.todayQty)
          ],
          colors: ["#C92933", "#48C7DB", "#FFCE56"]
        };
      });
  }

  function init(){
    vm.getQuotationsData();
    vm.getOrdersData()
  }

  vm.init();

}

DashboardCtrl.$inject = [
  '$rootScope',
  '$filter',
  'orderService',
  'quotationService'
];
