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
  cartService
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
    appliesForPackageOrPromotionDiscount: appliesForPackageOrPromotionDiscount,
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
    resetProductCartQuantity: resetProductCartQuantity,
    onDetailQuantityChange: onDetailQuantityChange,
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

    console.log('entered init.js', new Date());

    $rootScope.scrollTo('main');    
    vm.activeStore       = $rootScope.activeStore;
    vm.promotionPackages = [];
    options              = options || {};
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
        //vm.quotation.DetailsGroups = deliveryService.groupDetails(vm.quotation.Details);
        vm.isLoadingDetails = false;
        return quotationService.getCurrentStock(vm.quotation.id);       
      })
      .then(function(response){
        var detailsStock = response.data;
        vm.quotation.Details = quotationService.mapDetailsStock(vm.quotation.Details, detailsStock);

        loadDetailsDeliveries(vm.quotation.Details)
          .then(function(details){
            console.log('details after loadDetailsDeliveries', details);
            vm.quotation.Details = adjustSameProductsStock(vm.quotation.Details);
            vm.isLoadingDetailsDeliveries = false;
          });

        //vm.quotation.DetailsGroups = deliveryService.groupDetails(vm.quotation.Details);

        console.log('end loading quotation', new Date());
        vm.isValidatingStock = false;
      })
      .catch(function(err){
        var error = err.data || err;
        error = error ? error.toString() : '';
        dialogService.showDialog( (error) );
        console.log('error', err);
      });

  }

  function loadDetailsDeliveries(details){
    /*for(var i = 0; i < details.length; i++){
      loadDeliveriesByDetail( details[i] );
    }*/
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
        return setUpDetailDeliveries(detail, deliveries);
      });

  }

  function setUpDetailDeliveries(detail, deliveries){
    console.log('setUpDetailDeliveries detail id', detail.id);
    console.log('deliveries', deliveries);
    detail.productCart = {
      quantity: 1
    };

    deliveries = $filter('orderBy')(deliveries, 'date');
    detail.deliveries  = deliveries;
    detail.deliveriesGroups = deliveryService.groupDeliveryDates(detail.deliveries);
    detail.deliveriesGroups = $filter('orderBy')(detail.deliveriesGroups, 'date');

    detail.productCart = {
      quantity: 1
    };

    if(detail.deliveries && detail.deliveries.length > 0){
      detail.productCart.deliveryGroup = detail.deliveriesGroups[0];

      var deliveryGroupMatch = isShipDateInDeliveriesGroup(detail.shipDate, detail.deliveriesGroups);

      if( deliveryGroupMatch && deliveryGroupMatch.available >= detail.quantity){
        //Setting productCart quantity if the detail has shipping date and available date
        console.log('setting detail productCart quantity 2', detail.quantity)
        detail.productCart.deliveryGroup = deliveryGroupMatch;
        detail.productCart.quantity = detail.quantity;
      }else{
        console.log('detail else 2', detail.id);
        detail.productCart.quantity = 0;
      }
    }

    else{
      detail.productCart.quantity = 0;
    }

    return detail;
  }

  function adjustSameProductsStock(details){
    details = details.map(function(detail){
      var productTakenStock = getProductTakenStockFromRemainingDetails(detail, details);
      console.log('detail.deliveries', detail.deliveries);
      console.log('productTakenStock', productTakenStock);
      console.log('detail.deliveries after', detail.deliveries);
      var adjustedDetail = substractProductTakenStockFromDetail(
          detail,
          detail.deliveries,
          productTakenStock
        );
      return adjustedDetail;
    });
    //console.log('details adjustSameProductsStock', details);
    return details;
  }

  function getProductTakenStockFromRemainingDetails(currentDetail, allDetails){
    return _.reduce(allDetails, function(takenStock, detail){
      if(detail.Product.id === currentDetail.Product.id && detail.id !== currentDetail.id){
        takenStock += detail.quantity;
      }

      return takenStock;
    },0);
  }

  function substractProductTakenStockFromDetail(detail, deliveries, productTakenStock){
    console.log('detail id', detail.id);
    console.log('in substractProductTakenStockFromDetail productTakenStock', productTakenStock);
    for(var i = 0; i<deliveries.length; i++){
      console.log('deliveries[i]', deliveries[i]);
      console.log('deliveries[i].date', deliveries[i].date);
      console.log('deliveries[i].available', deliveries[i].available);
      console.log('deliveries[i].initalAvailable', deliveries[i].initalAvailable);

      deliveries[i].available = deliveries[i].initalAvailable -  productTakenStock;
      
      if(productTakenStock > deliveries[i].initalAvailable){
        console.log('TAKEN STOCK IS GREATER', detail.id);
        deliveries[i].available = detail.quantity;        
      }
    }
    
    //return deliveries;
    return setUpDetailDeliveries(detail, deliveries);
  }        

  function resetProductCartQuantity(detail){
    detail.productCart = cartService.resetProductCartQuantity(detail.productCart);
  }  

  function onDetailQuantityChange(detail){
    console.log('%c onDetailQuantityChange triggered!!!','color: green');
    console.log('detail id', detail.id);
    console.log('detail', detail);

    if(detail.quantity){
      vm.isLoadingDetailsDeliveries = true;
      /*
      detail.originalQuantity = _.clone(detail.quantity);
      detail.quantity = detail.productCart.quantity;
      */
      var detailQuantity = _.clone(detail.productCart.quantity);
      var quoationDetails = JSON.parse(JSON.stringify(vm.quotation.Details));


      console.log('quantity assigned with select', detailQuantity);
      console.log('vm.quotation.Details', quoationDetails);
      console.log('quotationDetails', _.clone(quoationDetails));

      for(var i= 0; i<quoationDetails.length; i++){
        if(quoationDetails[i].id === detail.id){
          console.log('quantity', detailQuantity);
          quoationDetails[i].quantity = detailQuantity;
        }
      }
      console.log('quoationDetails before adjustSameProductsStock', quoationDetails);
      //vm.isLoading = true;

      vm.quotation.Details = adjustSameProductsStock(quoationDetails);      

      console.log('vm.quotation.Details after adjustSameProductsStock', vm.quotation.Details);

      /*
      detail.subtotal = detail.productCart.quantity * detail.unitPrice;
      detail.total = detail.productCart.quantity * detail.unitPriceWithDiscount;

      detail.totalPg1 = detail.quantity * detail.unitPriceWithDiscountPg1;
      detail.totalPg2 = detail.quantity * detail.unitPriceWithDiscountPg2;
      detail.totalPg3 = detail.quantity * detail.unitPriceWithDiscountPg3;
      detail.totalPg4 = detail.quantity * detail.unitPriceWithDiscountPg4;
      detail.totalPg5 = detail.quantity * detail.unitPriceWithDiscountPg5;
      updateQuotationLocalVars();
      console.log('detail', detail);
      */
      //vm.isLoading = false;
      vm.isLoadingDetailsDeliveries = false; 
    }
  }

  function updateQuotationLocalVars(){
    var quotationAux = {
      totalProducts: 0,
      subtotal: 0,
      total: 0,
      totalPg1: 0,
      totalPg2: 0,
      totalPg3: 0,
      totalPg4: 0,
      totalPg5: 0
    };
    quotationAux = _.reduce(vm.quotation.Details, function(quotation,detail){
      quotation.totalProducts += detail.quantity;
      quotation.subtotal += detail.subtotal;
      quotation.total += detail.total;

      quotation.totalPg1 += detail.totalPg1;
      quotation.totalPg2 += detail.totalPg2;
      quotation.totalPg3 += detail.totalPg3;
      quotation.totalPg4 += detail.totalPg4;
      quotation.totalPg5 += detail.totalPg5;

      return quotation;
    }, quotationAux);

    vm.quotation = _.extend(vm.quotation, quotationAux);
    vm.quotation.discount = vm.quotation.total - vm.quotation.subtotal;
  }
    

  function isShipDateInDeliveriesGroup(shipDate, deliveriesGroups){
    var exists = _.find(deliveriesGroups, function(deliveryGroup){
      return moment(shipDate).format('DD-MM-YYYY') === moment(deliveryGroup.date).format('DD-MM-YYYY');
    });
    return exists;
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

  function sendByEmail(){
    console.log('vm.quotation', vm.quotation);

    if(!vm.quotation.Client){
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

  function appliesForPackageOrPromotionDiscount(detail){
    var appliesFor = false;
    if(detail.PromotionPackageApplied){
      appliesFor = 'packageDiscount';
    }else if(detail.discount){
      appliesFor = 'promoDiscount';
    }
    return appliesFor;
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
        vm.quotation.total         = updatedQuotation.total;
        vm.quotation.subtotal      = updatedQuotation.subtotal;
        vm.quotation.discount      = updatedQuotation.discount;
        vm.quotation.totalProducts = updatedQuotation.totalProducts;
        if(updatedQuotation.Details){
          vm.quotation.Details =  updateDetailsInfo(
            vm.quotation.Details, 
            updatedQuotation.Details
          );
          //vm.quotation.DetailsGroups = deliveryService.groupDetails(vm.quotation.Details);
        }

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

  function updateDetailsInfo(details, newDetails){
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

      var params = {
        Details: angular.copy(vm.quotation.Details)
      };

      params.Details = params.Details.map(function(detail){
        detail.originalShipDate = detail.productCart.deliveryGroup.date;
        detail.shipDate = detail.originalShipDate;
        detail.quantity = detail.productCart.quantity;
        return detail;
      });

      //delete params.Details;
      vm.isLoading = true;
      $rootScope.scrollTo('main');

      /*
      if(vm.quotation.Client){
        //quotationService.setActiveQuotation(vm.quotation.id);            
        $location.path('/checkout/client/' + vm.quotation.id);
      }
      else{
      */
      if(!vm.quotation.Client){      
        $location.path('/register')
          .search({
            addContact:true,
            quotation: vm.quotation.id
          });
      }
      vm.isLoading = false;     

      //TODO: Update details when edit mode is active
      
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
  'cartService'
];