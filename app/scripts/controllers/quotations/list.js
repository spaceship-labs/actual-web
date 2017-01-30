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

function QuotationsListCtrl(
    $q,
    $rootScope,
    $filter,
    commonService,
    authService,
    quotationService,
    storeService
  ){

  var vm = this;
  angular.extend(vm,{
    apiResourceQuotations: quotationService.getList,
    applyFilters: applyFilters,
    createdRowCb: createdRowCb,
    isUserAdminOrManager:  authService.isUserAdminOrManager,
    isUserSellerOrAdmin: authService.isUserSellerOrAdmin,
    onDateEndSelect: onDateEndSelect,
    onDateStartSelect: onDateStartSelect,
    dateEnd: false,
    defaultSort: [6, 'asc'],
    closedOptions: [
      {label: 'Abiertas', value: {'!': true}},
      {label:'Cerradas', value: true}
    ],    
    columnsLeads: [
      {key: 'folio', label:'Folio'},
      {key:'Client.CardName', label:'Cliente', defaultValue:'Sin cliente'},
      {key:'Client.E_Mail', label:'Email', defaultValue:'Sin cliente'},
      {key:'createdAt', label:'Cotización' ,date:true},
      {key:'total', label: 'Total', currency:true},
      {key:'status', label:'Status', 
        mapper:{
          'to-order':'Cerrada(orden)',
          'closed': 'Cerrada',
        },
        defaultValue: 'Abierta'
      },
      {
        key:'tracing', 
        label:'Seguimiento', 
        defaultValue: '-',
        color: 'red',
        //defaultValue: moment().add(5,'days').toDate(),
        dateTime: true
      },
      {
        key:'source',
        label:'Fuente',
        defaultValue:'-'
      },
      {
        key:'Acceder',
        label:'Acceder',
        propId: 'id',
        actions:[
          {url:'/quotations/edit/',type:'edit'},
        ]
      },
    ],
    endDate: false,
    quotationsData:{},
    listScopes: [],
    filters: {
      User: $rootScope.user.id,
      isClosed: {'!': true}
    },
    startDate: false,
    store:{
      ammounts:{}
    },    
    user: $rootScope.user,
  });

  vm.globalDateRange = {
    field: 'tracing',
    start: vm.startDate,
    end: vm.endDate
  }; 

  vm.listScopes = [
    {label: 'Mis oportunidades', value: vm.user.id},
    {label: 'Todas las oportunidades', value:'none'}
  ];

  function createdRowCb(row, data, index){
    var day = moment().startOf('day').toDate();
    if(data.tracing){
      var tracing = moment(data.tracing).startOf('day').toDate();
      if(tracing <= day){
        $(row).addClass('highlight').children().css( "background-color", "#faadb2" );
      }
    }
  }

  function init(){
    if(authService.isUserManager()){
      getSellersByStore(vm.user.mainStore.id);
    }
    else{
      getQuotationDataByUser(vm.user.id)
        .then(function(values){
          var userTotals = values[0];
          var userCounts = values[1];
          setupSellerChart(userTotals, userCounts);
        })
        .catch(function(err){
          console.log('err', err);
        });
      getCurrentUserTotal(vm.user.id, {
        startDate: vm.startDate,
        endDate: vm.endDate,
      });
    }
    
  }

  function getSellersByStore(storeId){
    var deferred = $q.defer();
    storeService.getSellersByStore(storeId)
      .then(function(res){
        vm.sellers = res.data;
        vm.sellers = vm.sellers.map(function(seller){
          seller.filters = {
            User: seller.id
          };
          return seller;
        });
        return updateSellersTotals();
      })
      .then(function(){
        deferred.resolve();
      })
      .catch(function(err){
        console.log(err);
        deferred.reject(err);
      });

    return deferred.promise;
  }

  function updateSellersTotals(){
    var deferred = $q.defer();

    if(vm.sellers){
      var promisesTotals = vm.sellers.map(function(seller){
        var params = {
          startDate: vm.startDate,
          endDate: vm.endDate,
          all: false,
          dateField: 'tracing',
          isClosed: vm.closedOptions[0].value
        };
        params.isClosed = seller.filters.isClosed || params.isClosed;
        return quotationService.getTotalsByUser(seller.id, params);
      });

      $q.all(promisesTotals)
        .then(function(totals){
          vm.sellers = vm.sellers.map(function(seller, index){
            seller.total = totals[index].data.byDateRange;
            return seller;
          });
          
          vm.store.ammounts.total = getStoreTotal(vm.sellers);
          var promises = vm.sellers.map(function(seller){
            return getQuotationDataByUser(seller.id);
          });
          return $q.all(promises);
        })
        .then(function(sellersData){

          var sellersAmounts = sellersData.map(function(data){
            return data[0];
          });
          var sellersQuantities = sellersData.map(function(data){
            return data[1];
          });
          setupStoreCharts(sellersAmounts, sellersQuantities);
          deferred.resolve();          
        })
        .catch(function(err){
          console.log(err);
          deferred.reject(err);
        });
    }else{
      deferred.resolve();
    }
    return deferred.promise;
  }  

  function getStoreTotal(sellers){
    var total = sellers.reduce(function(acum,seller){
      return acum += seller.total;
    },0);    
    return total;
  }

  function getQuotationDataByUser(userId, params){
    var deferred = $q.defer();
    var defaultParams = {
      startDate : vm.startDate,
      endDate   : vm.endDate,
      dateField : 'tracing',
      isClosed  : {'!': true}
    };
    params = params || defaultParams;
    $q.all([
      quotationService.getTotalsByUser(userId, params),
      quotationService.getCountByUser(userId, params)
    ])
      .then(function(result){
        console.log('result', result);
        var values = [
          result[0].data,
          result[1].data
        ];
        deferred.resolve(values);
      })
      .catch(function(err){
        console.log(err);
        deferred.reject(err);
      });

    return deferred.promise;
  }      


  function setupSellerChart(userTotals, userCounts){
    vm.quotationsData.untilTodayAmount  = userTotals.untilToday;
    vm.quotationsData.allByDateRangeAmount = userTotals.allByDateRange;
    vm.quotationsData.ammounts = {
      labels: ["Hoy", "FTD"],
      data: [
        vm.quotationsData.untilTodayAmount,
        (vm.quotationsData.allByDateRangeAmount - vm.quotationsData.untilTodayAmount)
      ],
      colors: ["#C92933", "#48C7DB", "#FFCE56"],
      options:{
        tooltips: {
          callbacks: {
            label: commonService.getCurrencyTooltip
          }
        }
      },
    };

    vm.quotationsData.untilTodayQty = userCounts.untilToday;
    vm.quotationsData.allByDateRangeQty = userCounts.allByDateRange;
    vm.quotationsData.quantities = {
      labels: ["Hoy", "Resto del mes"],
      data: [
        vm.quotationsData.untilTodayQty,
        (vm.quotationsData.allByDateRangeQty - vm.quotationsData.untilTodayQty)
      ],
      colors: ["#C92933", "#48C7DB", "#FFCE56"]
    };    
  }

  function getCurrentUserTotal(userId, dateRange){
    var deferred = $q.defer();
    var params = angular.extend(dateRange, {
      all:false,
      dateField: 'tracing'
    });
    quotationService.getTotalsByUser($rootScope.user.id, params)
      .then(function(res){
        var values = res.data;
        var total = values.byDateRange || 0;
        vm.currentUserTotal = total;
        deferred.resolve();
      })
      .catch(function(err){
        console.log(err);
        deferred.reject(err);
      });

    return deferred.promise;
  }

  function applyFilters(){
    vm.globalDateRange = {
      field: 'tracing',
      start: vm.startDate,
      end: vm.endDate
    }; 

    var promises = [
      getCurrentUserTotal(vm.user.id, {
        startDate: vm.startDate,
        endDate: vm.endDate,
      }),
      updateSellersTotals()
    ];

    if(!authService.isUserManager()){
      promises.push(getQuotationDataByUser(vm.user.id));
    }

    vm.isLoading = true;
    $q.all(promises)
      .then(function(results){
        $rootScope.$broadcast('reloadTable', true);

        if(!authService.isUserManager()){
          var userTotals = results[2][0];
          var userCounts = results[2][1];
          setupSellerChart(userTotals, userCounts);
        }

        vm.isLoading = false;
      })
      .catch(function(err){
        console.log(err);
      });
      
  }

  function onDateStartSelect(pikaday){
    vm.startDate = pikaday._d;
  }

  function onDateEndSelect(pikaday){
    vm.endDate = pikaday._d;
  }

  //@param sellers Array of seller object with untiltoday and bydaterange amounts and quantities
  function setupStoreCharts(sellersAmounts, sellersQuantities){
    vm.store.untilTodayAmount = sellersAmounts.reduce(function(acum, seller){
      acum += seller.untilToday;
      return acum;
    }, 0);
     vm.store.allByDateRangeAmount = sellersAmounts.reduce(function(acum, seller){
      acum += seller.allByDateRange;
      return acum;
    }, 0);
    vm.store.ammounts = {
      labels: ["Hoy", "Resto de la quincena"],
      data: [
        vm.store.untilTodayAmount,
        (vm.store.allByDateRangeAmount - vm.store.untilTodayAmount)
      ],
      colors: ["#C92933", "#48C7DB", "#FFCE56"],
      options:{
        tooltips: {
          callbacks: {
            label: commonService.getCurrencyTooltip
          }
        }
      },
    };

    vm.store.untilTodayQty = sellersQuantities.reduce(function(acum, seller){
      acum += seller.untilToday;
      return acum;
    }, 0);
     vm.store.allByDateRangeQty = sellersQuantities.reduce(function(acum, seller){
      acum += seller.allByDateRange;
      return acum;
    }, 0);

    vm.store.quantities = {
      labels: ["Hoy", "Resto del mes"],
      data: [
        vm.store.untilTodayQty,
        (vm.store.allByDateRangeQty - vm.store.untilTodayQty)
      ],
      colors: ["#C92933", "#48C7DB", "#FFCE56"]
    };    
  }
  

  init();
}
