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

function QuotationsEditCtrl($location,$routeParams, $q ,productService, $rootScope, $mdDialog, commonService, quotationService, api, cartService){

  var vm = this;

  vm.init = init;
  vm.getProducts = getProducts;
  vm.loadProductFilters = loadProductFilters;
  vm.getTotalPrice = getTotalPrice;
  vm.getTotalProducts = getTotalProducts;
  vm.toggleRecord = toggleRecord;
  vm.addRecord = addRecord;
  vm.attachImage = attachImage;
  vm.updateInfo = updateInfo;
  vm.addNewProduct = addNewProduct;
  vm.removeDetail = removeDetail;
  vm.alertRemoveDetail = alertRemoveDetail;
  vm.continueBuying = continueBuying;

  vm.newRecord = {};
  vm.api = api;
  vm.isLoadingRecords = false;

  vm.recordTypes = ['Email', 'Llamada', 'WhatsApp', 'Visita'];
  vm.closeTypes = [
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
  ];

  vm.timePickerOptions = {
      step: 20,
      timeFormat: 'g:ia',
      appendTo: 'body',
      disableTextInput:true
  };


  function toggleRecord(record){
    vm.quotation.Records.forEach(function(rec){
      if(rec.id != record.id){
        rec.isActive = false;
      }
    });
    record.isActive = !record.isActive;
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

      quotationService.addRecord(vm.quotation.id, params).then(function(res){
        console.log(res);
        if(res.data.id){
          vm.quotation.Records.push(res.data);
        }
        vm.newRecord = {};
        vm.isLoadingRecords = false;
      });
    }
  }

  function init(){
    vm.isLoading = true;
    quotationService.getById($routeParams.id).then(function(res){
      console.log(res.data);
      vm.isLoading = false;
      vm.quotation = res.data;
      var productsIds = [];
      vm.quotation.Details.forEach(function(detail){
        productsIds.push(detail.Product);
      });
      vm.getProducts(productsIds);
    });
  }

  function getProducts(productsIds){
    var params = {
      filters: {
        id: productsIds
      },
      populate_fields: ['FilterValues']
    };
    var page = 1;
    productService.getList(page,params).then(function(res){
      //vm.quotation.Products = res.data;
      var products = productService.formatProducts(res.data.data);

      console.log(products);

      //Match detail - product
      vm.quotation.Details.forEach(function(detail){
        //Populating detail with product info.
        detail.Product = _.findWhere( products, {id : detail.Product } );
        console.log(detail);
      });

      console.log(vm.quotation.Details);
      vm.loadProductFilters();
    });
  }


  function loadProductFilters(){
    productService.getAllFilters({quickread:true}).then(function(res){
      vm.filters = res.data;
      var filters = angular.copy(vm.filters);

      vm.quotation.Details.forEach(function(detail){

        filters = vm.filters.map(function(filter){
          filter.Values = [];
          detail.Product.FilterValues.forEach(function(value){
            if(value.Filter === filter.id){
              filter.Values.push(value);
            }
          });
          return filter;
        });

        filters = filters.filter(function(filter){
          return filter.Values.length > 0;
        });

        //console.log(vm.filters);
        detail.Product.Filters = filters;

      });
    });

    console.log(vm.quotation);
  }

  function getTotalPrice(){
    var total = 0;
    if(vm.quotation && vm.quotation.Details){
      vm.quotation.Details.forEach(function(detail){
        if(detail.Product && detail.Product.Price){
          total += detail.Product.Price * detail.Quantity;
        }
      });
    }
    return total;
  }

  function getTotalProducts(){
    var total = 0;
    if(vm.quotation && vm.quotation.Details){
      vm.quotation.Details.forEach(function(detail){
        total += detail.Quantity;
      });
    }
    return total;
  }


  function attachImage(file){
    vm.newRecord.file = file;
  }

  function updateInfo(){
    vm.isLoadingRecords = true;
    var params = vm.quotation.Info;
    quotationService.updateInfo(vm.quotation.id, params).then(function(res){
      console.log(res);
      vm.isLoadingRecords = false;
    });
  }

  function addNewProduct(){
    quotationService.setActiveQuotation(vm.quotation.id);
    $rootScope.$emit('newActiveQuotation', vm.quotation.id);
    $location.path('/search');
  }

  function removeDetail(detailId, index){
    vm.isLoadingDetails = true;
    quotationService.removeDetail(detailId).then(function(res){
      console.log(res);
      vm.quotation.Details.splice(index,1);
      vm.isLoadingDetails = false;
    });
  }

  function alertRemoveDetail(ev, detailId, detailIndex) {
    console.log('alertRemoveDetail')
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog.confirm()
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
    vm.isLoading = true;
    quotationService.update(vm.quotation.id, vm.quotation).then(function(res){
      vm.isLoading = false;
      var quotationUpdated = res.data;
      if(vm.quotation.Client){
        console.log('checkout client');
        $location.path('/checkout/client/' + vm.quotation.id);
      }else{
        console.log('addquotation');
        quotationService.setActiveQuotation(vm.quotation.id);
        $location.path('/addquotation');
      }
    });
  }

  vm.init();

}
