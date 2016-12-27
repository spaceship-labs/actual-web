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
  angular.extend(vm,{
    quotationsData: {},
    ordersData:{},
    getAverageTicket: getAverageTicket,
    getClosingPercentage: getClosingPercentage,
    currentDate: new Date()
  });

  function getQuotationsData(){
    var dateRange = {
      startDate: moment().startOf('day'),
      endDate: moment().endOf('day'),
    };
    quotationService.getTotalsByUser($rootScope.user.id, dateRange)
      .then(function(res){
        vm.quotationsData.todayAmmount = res.data.dateRange;
        vm.quotationsData.fortnightAmount = res.data.fortnight;
        vm.quotationsData.ammounts = {
          labels: ["Hoy", "Resto de la quincena"],
          data: [
            vm.quotationsData.todayAmmount,
            (vm.quotationsData.fortnightAmount - vm.quotationsData.todayAmmount)
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
        console.log('res',res);
        vm.quotationsData.todayQty = res.data.dateRange;
        vm.quotationsData.fortnightQty = res.data.fortnight;
        vm.quotationsData.quantities = {
          labels: ["Hoy", "Resto del mes"],
          data: [
            vm.quotationsData.todayQty,
            (vm.quotationsData.fortnightQty - vm.quotationsData.todayQty)
          ],
          colors: ["#C92933", "#48C7DB", "#FFCE56"]
        };
        console.log('quotationsData', vm.quotationsData);
      });
  }

  function getOrdersData(){
    var dateRange = {
      startDate: moment().startOf('day'),
      endDate: moment().endOf('day'),
    };
    orderService.getTotalsByUser($rootScope.user.id, dateRange)
      .then(function(res){
        console.log('res', res);
        vm.ordersData.todayAmmount = res.data.dateRange;
        vm.ordersData.fortnightAmount = res.data.fortnight;
        vm.ordersData.ammounts = {
          labels: ["Hoy", "Resto del mes"],
          data: [
            vm.ordersData.todayAmmount,
            (vm.ordersData.fortnightAmount - vm.ordersData.todayAmmount)
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
        vm.ordersData.fortnightQty = res.data.fortnight;
        vm.ordersData.quantities = {
          labels: ["Hoy", "Resto del mes"],
          data: [
            vm.ordersData.todayQty,
            (vm.ordersData.fortnightQty - vm.ordersData.todayQty)
          ],
          colors: ["#C92933", "#48C7DB", "#FFCE56"]
        };
      });
  }

  function getAverageTicket(){
    var average = 0;
    if(vm.ordersData.fortnightQty && vm.ordersData.monthAmmount){
      average = vm.ordersData.monthAmmount / vm.ordersData.fortnightQty;
    }
    return average;
  }

  function getClosingPercentage(){
    var percentage = 0;
    var onePercent = 0;
    if(vm.quotationsData.fortnightQty && vm.ordersData.fortnightQty){
      onePercent = vm.quotationsData.fortnightQty / 100;
      percentage = vm.ordersData.fortnightQty / onePercent;
    }
    percentage = percentage.toFixed(2);
    return percentage + '%';
  }

  function init(){
    getQuotationsData();
    getOrdersData();
  }

  init();

}

DashboardCtrl.$inject = [
  '$rootScope',
  '$filter',
  'orderService',
  'quotationService'
];
