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
  productService,
  $rootScope,
  $mdDialog,
  commonService,
  quotationService,
  api,
  cartService,
  dialogService,
  userService,
  packageService
){
  var vm = this;
  angular.extend(vm, {
    newRecord: {},
    api: api,
    isLoadingRecords: false,
    recordTypes: ['Email', 'Llamada', 'WhatsApp', 'Visita'],
    closeTypes: [
      'Cliente compró en otra tienda de la empresa.',
      'Cliente compró en otra mueblería.',
      'Cliente se murió',
      'Cliente solicita no ser contactado más',
      'Cliente ya no está interesado',
      'Cliente es incontactable',
      'Cliente se mudó',
      'Vendedor no dio seguimiento suficiente',
      'Vendedor cotizó artículos equivocados',
      'Los precios son altos',
      'Las fechas de entrega son tardadas',
      'No vendemos el articulo solicitado',
      'Otra razón (especificar)',
    ],
    timePickerOptions: {
        step: 20,
        timeFormat: 'g:ia',
        appendTo: 'body',
        disableTextInput:true
    },
    promotionPackages: [],
    addNewProduct: addNewProduct,
    appliesForPackageOrPromotionDiscount: appliesForPackageOrPromotionDiscount,
    addRecord: addRecord,
    alertRemoveDetail: alertRemoveDetail,
    attachImage: attachImage,
    closeQuotation: closeQuotation,
    continueBuying: continueBuying,
    getPromotionPackageById: getPromotionPackageById,
    getUnitPriceWithDiscount: getUnitPriceWithDiscount,
    getWarehouseById: getWarehouseById,
    init:init,
    removeDetail: removeDetail,
    toggleRecord: toggleRecord,
    sendByEmail: sendByEmail,
    print: print,
    daysDiff: daysDiff
  });

  vm.brokers = [];

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

  function loadWarehouses(){
    api.$http.get('/company/find').then(function(res){
      vm.warehouses = res.data;
    })
    .catch(function(err){
      $log.error(err);
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
    }else if(detail.Product.mainPromo){
      appliesFor = 'promoDiscount';
    }
    return appliesFor;
  }

  function addRecord(form){
    if(vm.newRecord.eventType && form.$valid){
      vm.isLoadingRecords = true;

      //Formatting date and time
      var date = moment(vm.newRecord.date._d)
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
        })
        .catch(function(err){
          $log.error(err);
        });
    }
  }

  function closeQuotation(form,closeReason, extraNotes){
    if(closeReason){
      vm.isLoading = true;
      var params = {
        dateTime: new Date(),
        eventType: 'Cierre',
        notes: extraNotes,
        User: $rootScope.user.id
      };
      quotationService.addRecord(vm.quotation.id, params)
        .then(function(res){
          if(res.data.id){
            vm.quotation.Records.push(res.data);
          }
          var updateParams = {
            isClosed: true,
            isClosedReason: closeReason,
            isClosedNotes: extraNotes
          };
          return quotationService.update(vm.quotation.id, updateParams);
        })
        .then(function(result){
          if(result.data){
            vm.quotation.isClosed = result.data.isClosed;
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
        })
    }
  }

  function init(){
    vm.isLoading = true;
    loadWarehouses();
    if($location.search().createdClient){
      dialogService.showDialog('Cliente registrado');
    }

    quotationService.getById($routeParams.id)
      .then(function(res){
        vm.isLoading = false;
        vm.quotation = res.data;
        vm.status = 'Abierta';
        if(vm.quotation.Order || vm.quotation.isClosed){
          vm.status = 'Cerrada';
        }
        return quotationService.getQuotationProducts(vm.quotation);
      })
      .then(function(details){
        vm.quotation.Details = details;
        return quotationService.loadProductFilters(vm.quotation.Details);
      })
      .then(function(details2){
        vm.quotation.Details = details2;
        vm.isLoadingRecords = true;
        return quotationService.getRecords(vm.quotation.id);
      })
      .then(function(result){
        var promisesArray = [];
        vm.quotation.Records = result.data;
        vm.isLoadingRecords = false;
        var packagesIds = vm.quotation.Details.reduce(function(acum, d){
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

    userService.getBrokers().then(function(brokers){
      vm.brokers = brokers;
    });
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

  function removeDetail(detailId, index){
    vm.isLoadingDetails = true;
    quotationService.removeDetail(detailId, vm.quotation.id)
      .then(function(res){
        var updatedQ = res.data;
        vm.quotation.Details.splice(index,1);
        vm.isLoadingDetails        = false;
        vm.quotation.total         = updatedQ.total;
        vm.quotation.subtotal      = updatedQ.subtotal;
        vm.quotation.discount      = updatedQ.discount;
        vm.quotation.totalProducts = updatedQ.totalProducts;
        if(updatedQ.Details){
          matchNewDetails(updatedQ.Details);
        }
        $rootScope.getActiveQuotation();
      })
      .catch(function(err){
        $log.error(err);
      })
  }

  function matchNewDetails(newDetails){
    for(var i=0;i<vm.quotation.Details.length; i++){
      var detail = vm.quotation.Details[i];
      var match = _.findWhere(newDetails, { id: detail.id } );
      if(match){
        detail.unitPrice        = match.unitPrice;
        detail.discountPercent  = match.discountPercent;
        detail.discount         = match.discount;
        detail.subtotal         = match.subtotal;
        detail.total            = match.total;
        detail.Promotion        = match.Promotion;
        detail.PromotionPackageApplied = match.PromotionPackageApplied;
      }
    }
  }

  function alertRemoveDetail(ev, detailId, detailIndex) {
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog
      .confirm()
      .title('¿Eliminar articulo de la cotizacion?')
      .textContent('-' + vm.quotation.Details[detailIndex].Product.Name)
      .ariaLabel('')
      .targetEvent(ev)
      .ok('Eliminar')
      .cancel('Cancelar');
    
    $mdDialog.show(confirm).then(function() {
      vm.removeDetail(detailId, detailIndex)
    }, function() {
      console.log('Eliminado');
    });
  }

  function continueBuying(){
    if(!vm.quotation.Order){
      vm.isLoading = true;

      var params = angular.copy(vm.quotation);
      if(params.Details){
        params.Details = params.Details.map(function(detail){
          detail.Product = detail.Product.id;
          return detail;
        });
      }

      console.log('------------------');
      console.log('params', params);

      quotationService.update(vm.quotation.id, params)
        .then(function(res){
          vm.isLoading = false;
          var quotationUpdated = res.data;
          if(vm.quotation.Client){
            quotationService.setActiveQuotation(vm.quotation.id);
            $location.path('/checkout/client/' + vm.quotation.id);
          }else{
            console.log('No hay cliente');
            quotationService.setActiveQuotation(vm.quotation.id);
            $location.path('/continuequotation').search({goToCheckout:true});
          }
        })
        .catch(function(err){
          $log.error(err);
        })
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

  vm.init();

}

QuotationsEditCtrl.$inject = [
  '$log',
  '$location',
  '$routeParams',
  '$q',
  '$scope',
  'localStorageService',
  'productService',
  '$rootScope',
  '$mdDialog',
  'commonService',
  'quotationService',
  'api',
  'cartService',
  'dialogService',
  'userService',
  'packageService'
];