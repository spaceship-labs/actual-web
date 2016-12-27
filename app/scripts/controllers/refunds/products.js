'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:RefundsProductsCtrl
 * @description
 * # RefundsProductsCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('RefundsProductsCtrl', RefundsProductsCtrl);

function RefundsProductsCtrl(
  $log,
  $location,
  $routeParams,
  $q,
  $scope,
  localStorageService,
  $rootScope,
  $mdMedia,
  $mdDialog,
  quotationService,
  orderService,
  api,
  dialogService,
  userService,
  packageService,
  deliveryService,
  DTOptionsBuilder, 
  DTColumnDefBuilder
){
  var vm = this;
  angular.extend(vm, {
    api: api,
    alertRemoveDetail: alertRemoveDetail,
    promotionPackages: [],
    appliesForPackageOrPromotionDiscount: appliesForPackageOrPromotionDiscount,
    getPromotionPackageById: getPromotionPackageById,
    getUnitPriceWithDiscount: getUnitPriceWithDiscount,
    getWarehouseById: getWarehouseById,
    isValidStock: isValidStock,
    removeDetail: removeDetail,
    removeDetailsGroup: removeDetailsGroup,
    sendByEmail: sendByEmail,
    print: print,
    daysDiff: daysDiff
  });

  $rootScope.$on('activeStoreAssigned', function(){
  });

  if($rootScope.isMainDataLoaded){
    vm.activeStore = $rootScope.activeStore;
    init();
  }else{
    var mainDataListener = $rootScope.$on('mainDataLoaded', function(ev, mainData){
      init();
    });
  }  

  function init(){
    vm.isLoading = true;
    loadWarehouses();
    showAlerts();
    vm.activeStore = $rootScope.activeStore;
    vm.brokers     = $rootScope.brokers;

    orderService.getById($routeParams.id)
      .then(function(res){
        vm.isLoading = false;
        vm.order = res.data;
        vm.status = 'Abierta';
        if(vm.order.Order || vm.order.isClosed){
          vm.status = 'Cerrada';
        }
        return quotationService.populateDetailsWithProducts(vm.order);
      })
      .then(function(details){
        vm.order.Details = details;
        return quotationService.loadProductFilters(vm.order.Details);
      })
      .then(function(detailsWithFilters){
        vm.order.Details = detailsWithFilters;
        vm.isLoadingRecords = true;
        vm.order.DetailsGroups = deliveryService.groupDetails(vm.order.Details);
        
        var promisesArray = [];
        var packagesIds = vm.order.Details.reduce(function(acum, d){
          if(d.PromotionPackageApplied){
            acum.push(d.PromotionPackageApplied);
          }
          return acum;
        },[]);
        packagesIds = _.uniq(packagesIds);
        packagesIds.forEach(function(pId){
          promisesArray.push(packageService.getDetailedPackage(pId));
        });
        if(promisesArray.length > 0){
          return $q.all(promisesArray);
        }
        return [];
      })
      .then(function(results){
        //Mapping HTTP response
        vm.promotionPackages = results.map(function(r){
          return r.data;
        });
      })
      .catch(function(err){
        $log.error(err);
      });

  }

  function alertRemoveDetail(ev, detailsGroup) {
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog
      .confirm()
      .title('Realizar devolución del articulo')
      .textContent('-' + detailsGroup.Product.Name)
      .ariaLabel('')
      .targetEvent(ev)
      .ok('Eliminar')
      .cancel('Cancelar');
    
    $mdDialog.show(confirm).then(function() {
      removeDetailsGroup(detailsGroup);
    }, function() {
      console.log('Eliminado');
    });
  }

  function showAlerts(){
    if($location.search().createdClient){
      dialogService.showDialog('Cliente registrado');
    }
    if($location.search().stockAlert){
      quotationService.showStockAlert();
    }
  }

  function loadWarehouses(){
    api.$http.get('/company/find').then(function(res){
      vm.warehouses = res.data;
    })
    .catch(function(err){
      $log.error(err);
    });
  }

  function print(){
    window.print();
  }

  function sendByEmail(){
    vm.isLoading = true;
    quotationService.sendByEmail(vm.order.id)
    .then(function(res){
      vm.isLoading = false;
      dialogService.showDialog('Email enviado al cliente');
    })
    .catch(function(err){
      $log.error(err);
      vm.isLoading = false;
      dialogService.showDialog('Hubo un error, intentalo de nuevo');
    });
  }


  function getWarehouseById(id){
    var warehouse = {};
    if(vm.warehouses){
      warehouse = _.findWhere(vm.warehouses, {id: id});
    }
    return warehouse;
  }


  function appliesForPackageOrPromotionDiscount(detail){
    var appliesFor = false;
    if(detail.PromotionPackageApplied){
      appliesFor = 'packageDiscount';
    }else if(detail.Product.mainPromo){
      appliesFor = 'promoDiscount';
    }
    return appliesFor;
  }

  function getPromotionPackageById(packageId){
    return _.findWhere(vm.promotionPackages, {id:packageId}); 
  }


  function removeDetailsGroup(detailsGroup){
    var deferred = $q.defer();
    vm.isLoadingDetails = true;
    var detailsIds = detailsGroup.details.map(function(d){return d.id;});
    var params = {
      detailsIds: detailsIds
    };
    quotationService.removeDetailsGroup(params, vm.order.id)
      .then(function(res){
        var updatedQuotation = res.data;
        vm.isLoadingDetails        = false;
        vm.order.total         = updatedQuotation.total;
        vm.order.subtotal      = updatedQuotation.subtotal;
        vm.order.discount      = updatedQuotation.discount;
        vm.order.totalProducts = updatedQuotation.totalProducts;
        if(updatedQuotation.Details){
          vm.order.Details =  updateDetailsInfo(
            vm.order.Details, 
            updatedQuotation.Details
          );
          vm.order.DetailsGroups = deliveryService.groupDetails(vm.order.Details);
        }
        return $rootScope.loadActiveQuotation();
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

  function removeDetail(detailId, index){
    vm.isLoadingDetails = true;
    quotationService.removeDetail(detailId, vm.order.id)
      .then(function(res){
        var updatedQuotation = res.data;
        vm.order.Details.splice(index,1);
        vm.isLoadingDetails        = false;
        vm.order.total         = updatedQuotation.total;
        vm.order.subtotal      = updatedQuotation.subtotal;
        vm.order.discount      = updatedQuotation.discount;
        vm.order.totalProducts = updatedQuotation.totalProducts;
        if(updatedQuotation.Details){
          vm.order.Details =  updateDetailsInfo(
            updatedQuotation.Details, 
            updatedQuotation.Details
          );
        }
        $rootScope.loadActiveQuotation();
      })
      .catch(function(err){
        $log.error(err);
      });
  }

  function updateDetailsInfo(details, newDetails){
    var removedDetailsIds = [];
    for(var i=0;i<details.length; i++){
      var detail = details[i];
      var match = _.findWhere(newDetails, { id: detail.id } );
      if(match){
        detail.unitPrice              = match.unitPrice;
        detail.discountPercentPromos  = match.discountPercentPromos;        
        detail.discountPercent        = match.discountPercent;
        detail.discount               = match.discount;
        detail.subtotal               = match.subtotal;
        detail.total                  = match.total;
        detail.Promotion              = match.Promotion;
        detail.PromotionPackageApplied = match.PromotionPackageApplied;
      }
    }
    details = details.filter(function(d){
      return _.findWhere(newDetails, {id: d.id});
    });
    return details;
  }

  function isValidStock(details){
    if(!details){
      return false;
    }
    return quotationService.isValidStock(details);    
  }


  function getUnitPriceWithDiscount(unitPrice,discountPercent){
    var result = unitPrice - ( ( unitPrice / 100) * discountPercent );
    return result;
  }

  function daysDiff(a, b) {
    a = (a && new Date(a)) || new Date();
    b = (b && new Date(b)) || new Date();
    var _MS_PER_DAY = 1000 * 60 * 60 * 24;
    var utc1        = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    var utc2        = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.abs(Math.floor((utc2 - utc1) / _MS_PER_DAY));
  }

  $scope.$on('$destroy', function(){
    mainDataListener();
  });

}

RefundsProductsCtrl.$inject = [
  '$log',
  '$location',
  '$routeParams',
  '$q',
  '$scope',
  'localStorageService',
  '$rootScope',
  '$mdMedia',
  '$mdDialog',
  'quotationService',
  'orderService',
  'api',
  'dialogService',
  'userService',
  'packageService',
  'deliveryService',
  'DTOptionsBuilder', 
  'DTColumnDefBuilder'
];