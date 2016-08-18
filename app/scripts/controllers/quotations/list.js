'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:QuotationsListCtrl
 * @description
 * # QuotationsListCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('QuotationsListCtrl', QuotationsListCtrl);

function QuotationsListCtrl($location,$routeParams, $q ,productService, $rootScope, $filter, commonService, quotationService){

  var vm = this;
  vm.init = init;
  vm.applyFilters = applyFilters;
  vm.onDateStartSelect = onDateStartSelect;
  vm.onDateEndSelect = onDateEndSelect;
  vm.getQuotationsData = getQuotationsData;
  vm.getTotalByDateRange = getTotalByDateRange;
  vm.filters = false;
  vm.dateEnd = false;
  vm.managers = [
    {
      sellers: [{},{},{},{}]
    },
    {
      sellers: [{},{},{},{}]
    },
    {
      sellers: [{},{},{},{}]
    }
  ];
  vm.columnsLeads = [
    {key: 'folio', label:'Folio'},
    {key:'Client.CardName', label:'Cliente', defaultValue:'Sin cliente'},
    {key:'Client.E_Mail', label:'Email', defaultValue:'Sin cliente'},
    {key:'createdAt', label:'Cotización' ,date:true},
    {key:'total', label: 'Total', currency:true},
    //{key:'DocCur', label:'Moneda', defaultValue: 'MXP'},
    {
      key:'Acciones',
      label:'Acciones',
      propId: 'id',
      actions:[
        {url:'/quotations/edit/',type:'edit'},
      ]
    },
  ];
  vm.quotationsData = {};
  vm.apiResourceLeads = quotationService.getList;


  function getQuotationsData(){
    var dateRange = {
      startDate: moment().startOf('day'),
      endDate: moment().endOf('day'),
    };
    quotationService.getTotalsByUser($rootScope.user.id, dateRange)
      .then(function(res){
        vm.quotationsData.todayAmmount = res.data.dateRange;
        vm.quotationsData.rangeAmmount = res.data.all;
        vm.quotationsData.ammounts = {
          labels: ["Hoy", "Resto del mes"],
          data: [
            vm.quotationsData.todayAmmount,
            (vm.quotationsData.rangeAmmount - vm.quotationsData.todayAmmount)
          ],
          colors: ["#C92933", "#48C7DB", "#FFCE56"],
          options:{
            tooltips: {
              callbacks: {
                label: function(tooltipItem, data) {
                  return data.labels[tooltipItem.index] + ': ' + $filter('currency')(data.datasets[0].data[tooltipItem.index]);
                }
              }
            }
          },

        };
      });

    quotationService.getCountByUser($rootScope.user.id, dateRange)
      .then(function(res){
        console.log(res);
        vm.quotationsData.todayQty = res.data.dateRange;
        vm.quotationsData.rangeQty = res.data.all;
        vm.quotationsData.quantities = {
          labels: ["Hoy", "Resto del mes"],
          data: [
            vm.quotationsData.todayQty,
            (vm.quotationsData.rangeQty - vm.quotationsData.todayQty)
          ],
          colors: ["#C92933", "#48C7DB", "#FFCE56"]
        };
      });
  }


  function init(){
    var monthRange = commonService.getMonthDateRange();
    var fortnightRange = commonService.getFortnightRange();
    vm.startDate = fortnightRange.start.toString();
    vm.endDate = fortnightRange.end.toString();
    vm.filters = {
      User: $rootScope.user.id,
    };
    vm.dateRange = {
      field: 'createdAt',
      start: vm.startDate,
      end: vm.endDate
    };
    vm.user = $rootScope.user;
    vm.getQuotationsData();
    vm.getTotalByDateRange(vm.user.id, {
      startDate: vm.startDate,
      endDate: vm.endDate,
    });
  }

  function getTotalByDateRange(userId, dateRange){
    var params = angular.extend(dateRange, {all:false});
    quotationService.getTotalsByUser($rootScope.user.id, params)
      .then(function(res){
        console.log(res);
        vm.totalDateRange = res.data.dateRange || 0;
      })
      .catch(function(err){
        console.log(err);
      });
  }

  function applyFilters(){
    if(vm.dateStart._d && vm.dateEnd._d){
      vm.dateRange = {
        field: 'createdAt',
        start: vm.dateStart._d,
        end: vm.dateEnd._d
      };
    }
    $rootScope.$broadcast('reloadTable', true);
  }

  function onDateStartSelect(pikaday){
    console.log(pikaday);
  }

  function onDateEndSelect(pikaday){
    console.log(pikaday);
  }


  vm.init();

}
