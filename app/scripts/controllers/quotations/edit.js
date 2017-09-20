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
  $timeout,
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
  siteService,
  productService,
  cartService,
  leadService
){
  var vm = this;
  var mainDataListener = function(){};
  angular.extend(vm, {
    newRecord: {},
    api: api,
    paymentAttemptsLimit: quotationService.PAYMENT_ATTEMPTS_LIMIT,
    isLoadingRecords: false,
    isLoading: true,
    timePickerOptions: {
        step: 20,
        timeFormat: 'g:ia',
        appendTo: 'body',
        disableTextInput:true
    },
    getQtyArray: getQtyArray,
    addNewProduct: addNewProduct,
    alertRemoveDetail: alertRemoveDetail,
    appliesForPackageDiscount: appliesForPackageDiscount,
    appliesForPromotionDiscount: appliesForPromotionDiscount,
    attachImage: attachImage,
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
    //removeDetailsGroup: removeDetailsGroup,
    sendByEmail: sendByEmail,
    showDetailGroupStockAlert: showDetailGroupStockAlert,
    showDetailStockAlert: showDetailStockAlert,
    toggleRecord: toggleRecord,
    isOrderPending: isOrderPending,
    hasSpeiOrder: hasSpeiOrder,
    onDetailQuantityChange: onDetailQuantityChange,
    showLeadFormDialog: showLeadFormDialog,
    isUserAdmin: authService.isUserAdmin($rootScope.user),
    onDetailShipDateChange: onDetailShipDateChange,
    isValidGroupDelivery: isValidGroupDelivery,
    isDetailEditionEnabled: isDetailEditionEnabled,
    isDetailPiecesEditionEnabled: isDetailPiecesEditionEnabled,
    isDetailRemoveOptionEnabled: isDetailRemoveOptionEnabled,
    isDetailAlertVisible: isDetailAlertVisible, 
    isDetailOutOfStock: isDetailOutOfStock,
    isOrderLinkVisible: isOrderLinkVisible,
    user: $rootScope.user
  });

  var activeQuotationListener = function(){};
  var activeStoreId = localStorageService.get('activeStore');
  //var validatedDetails = [];

  if($rootScope.activeStore){
    init($routeParams.id);
  }else{
    mainDataListener = $rootScope.$on('activeStoreAssigned', function(e){
      init($routeParams.id);
    });
  }

  function init(quotationId, options){
    // quotations/edit/59ad8640a5416ef524daa06f
    // product CO52060
    //product ST09960, ST01739
    //paquete de promociones /quotations/edit/59b6d0dec7f12ce06aa92d77
    // actualstudio.company
    console.log('entered init.js', new Date());
    options = options || {};
    $rootScope.scrollTo('main');    
    vm.activeStore       = $rootScope.activeStore;
    vm.promotionPackages = [];
    vm.isLoading = true;
    vm.isLoadingDetails = true;
    vm.isLoadingDetailsDeliveries = true;    
    vm.isValidatingStock = true;

    loadWarehouses();
    showAlerts();

    quotationService.getById(quotationId)
      .then(function(res){
        vm.isLoading = false;
        vm.quotation = res.data;
        
        if(!vm.quotation.OrderWeb && !vm.quotation.rateLimitReported){
          quotationService.setActiveQuotation(vm.quotation.id);
        }

        if(vm.quotation.rateLimitReported){
          quotationService.removeCurrentQuotation();
        }

        if(vm.quotation.OrderWeb){
          vm.quotation.isSpeiQuotation = vm.quotation.OrderWeb.isSpeiOrder;
        }

        if(vm.quotation.Address){
          loadQuotationAddress();
        }
        
        loadPaymentMethods();
        
        if(vm.isUserAdmin){
          loadQuotationLeads();
        }

        var populateParams = {
          populate: ['FilterValues']
        };
        return quotationService.populateDetailsWithProducts(vm.quotation,populateParams);
      })
      .then(function(details){
        vm.quotation.Details = details;
        return quotationService.loadProductsFilters(vm.quotation.Details);
      })
      .then(function(detailsWithFilters){
        vm.quotation.Details = detailsWithFilters;
        //vm.quotation.DetailsGroups = deliveryService.groupDetails(vm.quotation.Details);
        vm.isLoadingDetails = false;
        return quotationService.getCurrentStock(vm.quotation.id);       
      })
      .then(function(response){
        var detailsStock = response.data;
        vm.quotation.Details = quotationService.mapDetailsStock(vm.quotation.Details, detailsStock);
        vm.quotation.Details = quotationService.mapDetailsOriginalValues(vm.quotation.Details);

        console.log('end loading quotation', new Date());
        vm.isValidatingStock = false;

        return loadDetailsDeliveries(vm.quotation.Details);
      })
      .then(function(){
        vm.quotation.Details = quotationService.adjustSameProductsDeliveriesAndStock(vm.quotation.Details);
        vm.quotation.Details = quotationService.localMultipleDetailsUpdate(vm.quotation.Details);
        vm.quotation = quotationService.localQuotationUpdate(vm.quotation);
        vm.isLoadingDetailsDeliveries = false;        
      })
      .catch(function(err){
        var error = err.data || err;
        error = error ? error.toString() : '';
        dialogService.showDialog( (error) );
        console.log('error', err);
      });

  }

  function loadQuotationAddress(){
    quotationService.getAddress(vm.quotation.id)
      .then(function(address){
        console.log('address', address);
        vm.addressString = buildAddressString(address);
      });
  }

  function buildAddressString(address){
    var str = 'Número ' + address.U_Noexterior + ' Entre calle ' + 
      address.U_Entrecalle + ' y calle ' + address.U_Ycalle + ' colonia ' + 
      address.U_Colonia + ', ' + address.U_Mpio + ', ' + address.U_Estado + 
      ', ' + address.U_CP;

    return str;
  }

  function isOrderLinkVisible(){
    if (vm.quotation.OrderWeb){ 
      if(
          vm.isUserAdmin || 
          (isQuotationOwnedByUser() && vm.quotation.OrderWeb.status !== 'pending-sap')
        ){
        return true;
      }
    }

    return false;
  }

  function isQuotationOwnedByUser(){
    return vm.quotation.Client.id === vm.user.Client;
  }

  function isDetailRemoveOptionEnabled(detail){
    return !vm.quotation.Order && !vm.quotation.isClosed;
  }

  function isDetailEditionEnabled(detail){
    return detail.productCart && 
      detail.productCart.deliveryGroup &&
      !vm.isLoadingDetailsDeliveries;    
  }

  function isDetailPiecesEditionEnabled(detail){
    return !detail.PromotionPackageApplied; 
  }

  function isDetailAlertVisible(detail){
    return detail.availabilityChanged || 
      (!vm.isLoadingDetailsDeliveries && !detail.productCart.deliveryGroup);
  }

  function isDetailOutOfStock(detail){
    if(!hasDetailDeliveries(detail) && !vm.isLoadingDetailsDeliveries){
      return true;
    }

    return !hasDetailDeliveries(detail) && !vm.isLoadingDetailsDeliveries;
  }

  function hasDetailDeliveries(detail){
    if(!detail.deliveries){
      return false;
    }

    return detail.deliveries && detail.deliveries.length > 0;
  }

  function isValidGroupDelivery(groupDelivery){
    return (groupDelivery.available > 0);
  }

  function loadDetailsDeliveries(details){
    var promises = details.map(function(detail){
      return loadDeliveriesByDetail(detail);
    });
    return $q.all(promises);
  }
  
  function loadDeliveriesByDetail(detail){
    var options = {
      productId: detail.Product.id,
      productItemCode: detail.Product.ItemCode,
      activeStoreId: activeStoreId,
      zipcodeDeliveryId: vm.quotation.ZipcodeDelivery.id
    };

    return productService.delivery(options.productItemCode, options.zipcodeDeliveryId)
      .then(function(deliveries){
        deliveries = deliveries.map(function(delivery){
          delivery.initalAvailable = _.clone(delivery.available);
          return delivery;
        });

        if(detail.PromotionPackageApplied){
          deliveries = deliveryService.removeInvalidDeliveriesForPackages(detail,deliveries);
        }
        
        return deliveryService.setUpDetailDeliveries(detail, deliveries);
      });
  }

  function cloneArrayOfObjects(arr){
    return JSON.parse(JSON.stringify(arr));
  }

  function onDetailShipDateChange(detail){
    if(!vm.isCalculatingAvailability){
      vm.isCalculatingAvailability = true;

      var quotationDetails = cloneArrayOfObjects(vm.quotation.Details);

      for(var i= 0; i<quotationDetails.length; i++){
        if( quotationDetails[i].id === detail.id ){
          quotationDetails[i].shipDate = detail.productCart.deliveryGroup.date;
          quotationDetails[i] = quotationService.localDetailUpdate(quotationDetails[i]);
        }
      }

      vm.quotation.Details = quotationService.adjustSameProductsDeliveriesAndStock(quotationDetails);
      vm.quotation = quotationService.localQuotationUpdate(vm.quotation);      
      $timeout(function(){
        vm.isCalculatingAvailability = false;      
      },800);
    }    
  }

  function onDetailQuantityChange($ev,detail){
    if(detail.quantity && !vm.isCalculatingAvailability){
      vm.isCalculatingAvailability = true;

      var detailQuantity = _.clone(detail.productCart.quantity);
      var quotationDetails = cloneArrayOfObjects(vm.quotation.Details);

      for(var i= 0; i<quotationDetails.length; i++){
        if( quotationDetails[i].id === detail.id ){
          quotationDetails[i].quantity = detailQuantity;
          quotationDetails[i] = quotationService.localDetailUpdate(quotationDetails[i]);
        }
      }

      vm.quotation.Details = quotationService.adjustSameProductsDeliveriesAndStock(quotationDetails);
      vm.quotation = quotationService.localQuotationUpdate(vm.quotation);      
      $timeout(function(){
        vm.isCalculatingAvailability = false;      
      },800);
    }
  }
    
  function getQtyArray(n){
    n = n || 0;
    var arr = [];
    for(var i=0;i<n;i++){
      arr.push(i+1);
    }
    return arr;
  }

  function isOrderPending(order){
    if(!order){
      return false;
    }
    return order.status === 'pending-sap'  || order.status === 'pending-payment';
  }

  function hasSpeiOrder(order){
    if(!order){
      return false;
    }
    return order.isSpeiOrder;
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

  function sendQuotationAndSaveLead(){
    showLeadFormDialog();
  }

  function showLeadFormDialog(ev) {
    ev = null;
    var templateUrl = 'views/partials/lead-form-dialog.html';
    var controller  = LeadFormDialogController;
    $mdDialog.show({
      controller: [
        '$mdDialog',
        'leadService',
        'params',
        controller
      ],
      controllerAs: 'ctrl',
      templateUrl: templateUrl,
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      fullscreen: false,
      locals:{
        params:{
          quotationId: vm.quotation.id
        }
      }
    })
    .then(function(res) {
      console.log('res', res);
      dialogService.showDialog('Cotización enviada');
    })
    .catch(function(err){
      var errMsg = '';
      if(err){
        errMsg = err.data || err;
        errMsg = errMsg ? errMsg.toString() : '';
        dialogService.showDialog(errMsg);
      }      
    });
  }  

  function sendByEmail(){
    if(!vm.quotation.Client){
      sendQuotationAndSaveLead();
      return;

      $location.path('/register')
        .search({
          //addContact:true,
          quotation: vm.quotation.id,
          redirectTo: '/quotations/edit/' + vm.quotation.id
        });
      return;
    }

    vm.isLoading = true;
    $rootScope.scrollTo('main');
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

  function appliesForPackageDiscount(detail){
    if(detail.PromotionPackageApplied){
      return true;
    }
    return false;
  }

  function appliesForPromotionDiscount(detail){
    return (!detail.PromotionPackageApplied && detail.Promotion);
  }

  function getPromotionPackageById(packageId){
    return _.findWhere(vm.promotionPackages, {id:packageId}); 
  }

  function attachImage(file){
    vm.newRecord.file = file;
  }

  function addNewProduct(){
    quotationService.setActiveQuotation(vm.quotation.id);
    $rootScope.$emit('newActiveQuotation', vm.quotation.id);
    $location.path('/');
  }

  function alertRemoveDetail(ev, detail) {
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog
      .confirm()
      .title('¿Eliminar articulo de la cotizacion?')
      .textContent('-' + detail.Product.Name)
      .ariaLabel('')
      .targetEvent(ev)
      .ok('Eliminar')
      .cancel('Cancelar');
    
    $mdDialog.show(confirm).then(function() {
      removeDetail(detail);
      //removeDetailsGroup(detailsGroup);
    }, function() {
      console.log('Eliminado');
    });
  }


  function removeDetail(detail){
    var detailId = detail.id;
    vm.isLoadingDetails = true;
    $rootScope.scrollTo('main');
    return quotationService.removeDetail(detailId, vm.quotation.id)
      .then(function(res){
        var updatedQuotation = res.data;

        //Removing deleted detail from local variables
        var removedDetailIndex = getRemovedDetailIndex(detailId, vm.quotation.Details);
        vm.quotation.Details.splice(removedDetailIndex,1);

        vm.isLoadingDetails        = false;
        vm.quotation = quotationService.localQuotationUpdateWithNewValues(vm.quotation, updatedQuotation);
        if(updatedQuotation.Details){
          vm.quotation.Details =  matchDetailsWithNewDetails(vm.quotation.Details, updatedQuotation.Details);
          //vm.quotation.DetailsGroups = deliveryService.groupDetails(vm.quotation.Details);
        }

        vm.quotation = quotationService.localQuotationUpdate(vm.quotation);
        vm.quotation.Details = quotationService.adjustSameProductsDeliveriesAndStock(vm.quotation.Details);
        loadPaymentMethods();
        return $rootScope.loadActiveQuotation();
      })
      .catch(function(err){
        $log.error(err);
      });
  }

  function getRemovedDetailIndex(detailId, allDetails){
    var indexes = allDetails.map(function(detail, index){
      if(detailId === detail.id){
        return index;
      }else{
        return  'invalidIndex';
      }
    });
    var validIndexes = indexes.filter(function(index){
      return index !== 'invalidIndex';
    });

    return validIndexes[0];
  }

  function matchDetailsWithNewDetails(details, newDetails){
    for(var i=0;i<details.length; i++){
      var newDetail = _.findWhere(newDetails, { id: details[i].id } );
      if(newDetail){
        console.log('newDetail', newDetail);
        details[i] = quotationService.localDetailUpdateWithNewValues(details[i], newDetail);
      }
    }

    //Removing all details that aren't new
    details = details.filter(function(d){
      return _.findWhere(newDetails, {id: d.id});
    });
    return quotationService.localMultipleDetailsUpdate(details);
  }

  function isValidStock(details){
    if(!details){
      return false;
    }

    var isQuotationValidStock = quotationService.isValidStock(details);
    var detailsChanged = didDetailsChanged();

    if(detailsChanged){
      return true;
    }

    return isQuotationValidStock;
  }

  function didDetailsChanged(){
    return _.some(vm.quotation.Details, function(detail){
      return detail.availabilityChanged;
    });
  }


  function continueBuying(){
    /*
    if( !isValidStock(vm.quotation.Details) ){
      quotationService.showStockAlert();
      return;
    }
    */

    if(!vm.quotation.Details || vm.quotation.Details.length === 0){
      dialogService.showDialog('No hay artículos en esta cotización');
      return;
    }

    if(!vm.quotation.Order){
      vm.isLoading = true;
      $rootScope.scrollTo('main');

      var params = {
        Details: angular.copy(vm.quotation.Details)
      };

      params.Details = params.Details.map(function(detail){
        detail.originalShipDate = detail.productCart.deliveryGroup.date;
        detail.shipDate = detail.originalShipDate;
        detail.quantity = _.clone(detail.productCart.quantity);
        return detail;
      });

      quotationService.updateDetails(vm.quotation.id, params)
        .then(function(res){
          console.log('res updateDetails', res);

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

  function loadQuotationLeads(){
    vm.isLoadingLeads = true;

    leadService.getQuotationLeads(vm.quotation.id)
      .then(function(leads){
        console.log('leads', leads);
        vm.leads = leads;
        vm.isLoadingLeads = false;
      })
      .catch(function(err){
        console.log('err leads load', err);
        vm.isLoadingLeads = false;

      });
  }


  function showDetailStockAlert(ev,detail){
    var controller = StockDialogController;
    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));    
    $mdDialog.show({
      controller: [
        '$scope', 
        '$mdDialog',
        '$location',
        'quotationService', 
        'vm', 
        'detail',
        controller
      ],
      templateUrl: 'views/quotations/stock-dialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      fullscreen: useFullScreen,
      locals:{
        vm: vm,
        detail: detail
      }
    })
    .then(function() {
    })
    .catch(function() {
      console.log('cancelled');
    });    
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

  $scope.$on('$destroy', function(){
    $mdDialog.hide();
    mainDataListener();
  });

}

QuotationsEditCtrl.$inject = [
  '$timeout',
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
  'productService',
  'cartService',
  'leadService'
];