'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:QuotationsEditCtrl
 * @description
 * # QuotationsEditCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('QuotationsEditCtrl', QuotationsEditCtrl);

function QuotationsEditCtrl(
  $log,
  $location,
  $routeParams,
  $q,
  $scope,
  localStorageService,
  $rootScope,
  $mdMedia,
  $mdDialog,
  $filter,
  quotationService,
  api,
  dialogService,
  userService,
  packageService,
  paymentService,
  deliveryService,
  authService,
  siteService
){
  var vm = this;
  var mainDataListener = function(){};
  angular.extend(vm, {
    newRecord: {},
    api: api,
    isLoadingRecords: false,
    isLoading: true,
    timePickerOptions: {
        step: 20,
        timeFormat: 'g:ia',
        appendTo: 'body',
        disableTextInput:true
    },
    addNewProduct: addNewProduct,
    addRecord: addRecord,
    alertRemoveDetail: alertRemoveDetail,
    appliesForPackageOrPromotionDiscount: appliesForPackageOrPromotionDiscount,
    attachImage: attachImage,
    closeQuotation: closeQuotation,
    continueBuying: continueBuying,
    daysDiff: daysDiff,
    getPromotionPackageById: getPromotionPackageById,
    getUnitPriceWithDiscount: getUnitPriceWithDiscount,
    getWarehouseById: getWarehouseById,
    isUserAdminOrManager: authService.isUserAdminOrManager,
    isValidStock: isValidStock,
    print: print,
    promotionPackages: [],
    removeDetail: removeDetail,
    removeDetailsGroup: removeDetailsGroup,
    sendByEmail: sendByEmail,
    showBigTicketDialog: showBigTicketDialog,
    showDetailGroupStockAlert: showDetailGroupStockAlert,
    toggleRecord: toggleRecord,
    deattachImage: deattachImage,
    user: $rootScope.user
  });

  if($rootScope.activeStore){
    init($routeParams.id);
  }else{
    mainDataListener = $rootScope.$on('activeStoreAssigned', function(e){
      init($routeParams.id);
    });
  }

  function init(quotationId, options){
    console.log('entered init.js', new Date());

    vm.activeStore       = $rootScope.activeStore;
    vm.promotionPackages = [];
    options              = options || {};
    vm.isLoading = true;
    vm.isLoadingDetails = true;

    loadWarehouses();
    showAlerts();

    quotationService.getById(quotationId)
      .then(function(res){
        vm.isLoading = false;
        vm.quotation = res.data;
        quotationService.setActiveQuotation(vm.quotation.id);

        vm.status = 'Abierta';
        if(vm.quotation.Order || vm.quotation.isClosed){
          vm.status = 'Cerrada';
        }

        loadPaymentMethods();

        console.log('details not populated '+ new Date(), _.clone(vm.quotation.Details) );
        return quotationService.populateDetailsWithProducts(
          vm.quotation,{
            populate: ['FilterValues']
          }
        );
      })
      .then(function(details){
        console.log('details post populateDetailsWithProducts' + new Date(), _.clone(details) );
        vm.quotation.Details = details;
        return quotationService.loadProductsFilters(vm.quotation.Details);
      })
      .then(function(detailsWithFilters){
        vm.quotation.Details = detailsWithFilters;
        vm.quotation.DetailsGroups = deliveryService.groupDetails(vm.quotation.Details);
        vm.isLoadingDetails = false;
        vm.isValidatingStock = true;
        return quotationService.getCurrentStock(vm.quotation.id);       
      })
      .then(function(response){
        var detailsStock = response.data;
        console.log('details' + new Date(), _.clone(vm.quotation.Details) );
        vm.quotation.Details = quotationService.mapDetailsStock(vm.quotation.Details, detailsStock);
        vm.quotation.DetailsGroups = deliveryService.groupDetails(vm.quotation.Details);

        console.log('end loading quotation', new Date());
        vm.isValidatingStock = false;
      })
      .catch(function(err){
        var error = err.data || err;
        error = error ? error.toString() : '';
        dialogService.showDialog('Hubo un error: ' + (error) );
        console.log('error', err);
      });

  }

  function showAlerts(){
    if($location.search().startQuotation){
      //dialogService.showDialog('Cotizacion creada, agrega productos a tu cotización');
    }    
    if($location.search().createdClient){
      //dialogService.showDialog('Cliente registrado');
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

  function loadPaymentMethods(){
    vm.isLoadingPaymentMethods = true;
    quotationService.getPaymentOptions(vm.quotation.id)
      .then(function(response){
        var groups = response.data || [];
        vm.paymentMethodsGroups = groups;
        vm.isLoadingPaymentMethods = false;
      })
      .catch(function(err){
        console.log('err', err);
        vm.isLoadingPaymentMethods = false;
      });
  }
 
  function print(){
    window.print();
  }

  function sendByEmail(){
    vm.isLoading = true;
    quotationService.sendByEmail(vm.quotation.id)
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

  function toggleRecord(record){
    vm.quotation.Records.forEach(function(rec){
      if(rec.id != record.id){
        rec.isActive = false;
      }
    });
    record.isActive = !record.isActive;
  }

  function appliesForPackageOrPromotionDiscount(detail){
    var appliesFor = false;
    if(detail.PromotionPackageApplied){
      appliesFor = 'packageDiscount';
    }else if(detail.discount){
      appliesFor = 'promoDiscount';
    }
    return appliesFor;
  }

  function addRecord(form){
    if(vm.newRecord.eventType && form.$valid){
      vm.isLoadingRecords = true;

      //Formatting date and time
      var date = moment(vm.newRecord.date._d);
      var time = vm.newRecord.time;
      var year = date.get('year');
      var month = date.get('month');
      var day = date.get('date');
      var dateTime = moment(time).set('year',year).set('month',month).set('date',day)._d;

      vm.newRecord.dateTime = dateTime;
      var params = {
        dateTime: vm.newRecord.dateTime,
        eventType: vm.newRecord.eventType,
        notes: vm.newRecord.notes,
        User: $rootScope.user.id,
        file: vm.newRecord.file
      };

      quotationService.addRecord(vm.quotation.id, params)
        .then(function(res){
          if(res.data.id){
            vm.quotation.Records.push(res.data);
          }
          vm.newRecord = {};
          vm.isLoadingRecords = false;
          dialogService.showDialog('Evento guardado');
        })
        .catch(function(err){
          dialogService.showDialog('Hubo un error ' + (err.data || err) );
          $log.error(err);
          vm.isLoadingRecords = false;
        });

    }else{
      dialogService.showDialog('Datos incompletos, revisa los campos');
    }
  }


  function closeQuotation(form,closeReason, extraNotes){
    if(closeReason){
      vm.isLoading = true;
      var params = {
        notes: extraNotes,
        User: $rootScope.user.id,
        closeReason: closeReason,
        extraNotes: extraNotes
      };
      quotationService.closeQuotation(vm.quotation.id, params)
        .then(function(res){
          var record = res.data.record;
          var quotation = res.data.quotation;
          if(record){
            vm.quotation.Records.push(record);
          }
          if(quotation){
            vm.quotation.isClosed = quotation.isClosed;
            if(vm.quotation.isClosed){
              vm.status = 'Cerrada';
            }
          }
          vm.isLoading = false;
          vm.quotation.Records.forEach(function(rec){
            rec.isActive = false;
          }); 
        })         
        .catch(function(err){
          $log.error(err);
        });
    }
  }

  function getPromotionPackageById(packageId){
    return _.findWhere(vm.promotionPackages, {id:packageId}); 
  }

  function attachImage(file){
    vm.newRecord.file = file;
  }

  function deattachImage(){
    if(vm.newRecord){
      delete vm.newRecord.file;
    }
  }

  function addNewProduct(){
    quotationService.setActiveQuotation(vm.quotation.id);
    $rootScope.$emit('newActiveQuotation', vm.quotation.id);
    $location.path('/');
  }

  function alertRemoveDetail(ev, detailsGroup) {
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog
      .confirm()
      .title('¿Eliminar articulo de la cotizacion?')
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

  function removeDetailsGroup(detailsGroup){
    var deferred = $q.defer();
    vm.isLoadingDetails = true;
    var detailsIds = detailsGroup.details.map(function(d){return d.id;});
    var params = {
      detailsIds: detailsIds
    };
    quotationService.removeDetailsGroup(params, vm.quotation.id)
      .then(function(res){
        var updatedQuotation = res.data;
        vm.isLoadingDetails        = false;
        vm.quotation.total         = updatedQuotation.total;
        vm.quotation.subtotal      = updatedQuotation.subtotal;
        vm.quotation.discount      = updatedQuotation.discount;
        vm.quotation.totalProducts = updatedQuotation.totalProducts;
        if(updatedQuotation.Details){
          vm.quotation.Details =  updateDetailsInfo(
            vm.quotation.Details, 
            updatedQuotation.Details
          );
          vm.quotation.DetailsGroups = deliveryService.groupDetails(vm.quotation.Details);
        }

        loadPaymentMethods();
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
    quotationService.removeDetail(detailId, vm.quotation.id)
      .then(function(res){
        var updatedQuotation = res.data;
        vm.quotation.Details.splice(index,1);
        vm.isLoadingDetails        = false;
        vm.quotation.total         = updatedQuotation.total;
        vm.quotation.subtotal      = updatedQuotation.subtotal;
        vm.quotation.discount      = updatedQuotation.discount;
        vm.quotation.totalProducts = updatedQuotation.totalProducts;
        if(updatedQuotation.Details){
          vm.quotation.Details =  updateDetailsInfo(
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

  function showInvoiceDataAlertIfNeeded(ev){
    var controller = InvoiceDialogController;
    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')); 

    if(!vm.quotation.immediateDelivery || !vm.quotation.Client){
      var deferred = $q.defer();
      deferred.resolve(true);
      return  deferred.promise;
    }

    return $mdDialog.show({
      controller: [
        '$scope', 
        '$mdDialog',
        '$location',
        'quotation',
        'client',
        controller
      ],
      templateUrl: 'views/checkout/invoice-dialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      fullscreen: useFullScreen,
      locals:{
        quotation: vm.quotation,
        client: vm.quotation.Client
      }
    });
  }  

  function continueBuying(){
    if( !isValidStock(vm.quotation.Details) ){
      quotationService.showStockAlert();
      return;
    }

    if(!vm.quotation.Details || vm.quotation.Details.length === 0){
      dialogService.showDialog('No hay artículos en esta cotización');
      return;
    }

    if(!vm.quotation.Order){

      //Not updating Details, not necessary
      var params = angular.copy(vm.quotation);
      delete params.Details;
      vm.isLoading = true;
      $rootScope.scrollTo('main');

      quotationService.update(vm.quotation.id, params)
        .then(function(res){
          var quotationUpdated = res.data;

          if(  quotationHasImmediateDeliveryProducts(vm.quotation) ){
            var immediateDeliveryMsg = 'Has elegido un artículo de "entrega en tienda", recuerda que el cliente se lo llevara por sus medios al finalizar la orden de compra';
            dialogService.showDialog(immediateDeliveryMsg);
          }


          if(vm.quotation.Client){
            //quotationService.setActiveQuotation(vm.quotation.id);
            
            $location.path('/checkout/client/' + vm.quotation.id);
          }
          else{
            $location.path('/register')
              .search({
                addContact:true,
                quotation: vm.quotation.id
              });
          }
          vm.isLoading = false;        
        })
        .catch(function(err){
          $log.error(err);
        });

    }else{
      dialogService.showDialog('Esta cotización ya tiene un pedido asignado');
    }
  }

  function quotationHasImmediateDeliveryProducts(quotation){
    return _.some(quotation.Details, function(detail){
      return detail.immediateDelivery;
    });
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

  function showDetailGroupStockAlert(ev,detailGroup){
    var controller = StockDialogController;
    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));    
    $mdDialog.show({
      controller: [
        '$scope', 
        '$mdDialog',
        '$location',
        'quotationService', 
        'vm', 
        'detailGroup',
        controller
      ],
      templateUrl: 'views/quotations/stock-dialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      fullscreen: useFullScreen,
      locals:{
        vm: vm,
        detailGroup: detailGroup
      }
    })
    .then(function() {
    })
    .catch(function() {
      console.log('cancelled');
    });    
  }


  function showBigTicketDialog(ev){
    var controller = BigTicketController;
    var options = {
      bigticketMaxPercentage: vm.quotation.bigticketMaxPercentage,
      bigticketPercentage: vm.quotation.bigticketPercentage || 0
    };
    $mdDialog.show({
      controller: [
        '$scope',
        '$mdDialog',
        'options', 
        controller
      ],
      templateUrl: 'views/quotations/bigticket-dialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      fullscreen: false,
      locals:{
        options: options
      }
    })
    .then(function(percentage) {
      console.log('Big ticket aplicado');
      vm.isLoading = true;
      quotationService.update(vm.quotation.id, {bigticketPercentage: percentage})
        .then(function(res){
          var quotation = res.data;
          console.log('res', res);
          init(quotation.id, {reload:true});
        })
        .catch(function(err){
          vm.isLoading = false;
          console.log('err', err);
        });
    }, function() {
      console.log('No autorizado');
    });    
  } 


  $scope.$on('$destroy', function(){
    mainDataListener();
  });

}

QuotationsEditCtrl.$inject = [
  '$log',
  '$location',
  '$routeParams',
  '$q',
  '$scope',
  'localStorageService',
  '$rootScope',
  '$mdMedia',
  '$mdDialog',
  '$filter',
  'quotationService',
  'api',
  'dialogService',
  'userService',
  'packageService',
  'paymentService',
  'deliveryService',
  'authService',
  'siteService',
];