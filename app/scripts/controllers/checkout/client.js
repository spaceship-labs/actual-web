'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:CheckoutClientCtrl
 * @description
 * # CheckoutClientCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('CheckoutClientCtrl', CheckoutClientCtrl);

function CheckoutClientCtrl(
  commonService, 
  clientService ,
  $timeout,
  $routeParams, 
  $rootScope, 
  $location,
  categoriesService, 
  productService, 
  quotationService, 
  orderService,
  dialogService
){
  var vm = this;
  angular.extend(vm,{
    continueProcess: continueProcess,
    isClientFiscalDataValid: isClientFiscalDataValid
  });

  function init(){
    $location.search({});
    vm.isLoading = true;
    quotationService.getById($routeParams.id).then(function(res){
      vm.quotation = res.data;
      vm.isLoading = false;
      return quotationService.validateQuotationStockById(vm.quotation.id); 
    })
    .then(function(isValidStock){
      if( !isValidStock){
        $location.path('/quotations/edit/' + vm.quotation.id)
          .search({stockAlert:true});
      }

      if(vm.quotation.Order){
        $location.path('/checkout/order/' + vm.quotation.Order.id);
      }

      if(vm.quotation.Client){
        clientService.getById(vm.quotation.Client.id)
          .then(function(res){
            vm.client = res.data;
            vm.contacts = vm.client.Contacts.map(function(contact){
              contact.completeAdrress = buildAddress(contact);
              return contact;
            });
            if(!vm.quotation.Address && vm.contacts.length > 0){
              vm.quotation.Address = vm.contacts[0].id;
            }            
          });
      }
      
    });
  }

  function buildAddress(contact){
    var address = '';
    address += 'Calle: ' + contact.address;
    address += contact.U_Noexterior ? ', no. exterior: '+ contact.U_Noexterior : null;
    address += contact.U_Nointerior ? ', no. interior: '+ contact.U_Nointerior : null;
    address += contact.U_Colonia ? ', colonia: '+ contact.U_Colonia : null;
    address += contact.U_Mpio ? ', municipio: '+ contact.U_Mpio : null;
    address += contact.U_Ciudad ? ', ciudad: '+ contact.U_Ciudad : null;
    address += contact.U_Estado ? ', estado: '+ contact.U_Estado : null;
    address += contact.U_CP ? ', código postal: '+ contact.U_CP : null;
    address += contact.U_Estado ? ', estado: '+ contact.U_Estado : null;
    address += contact.U_Entrecalle ? ', entre calle: '+ contact.U_Entrecalle : null;
    address += contact.U_Ycalle ? ' y calle: '+ contact.U_Ycalle : null;
    address += contact.U_Notes1 ? ', referencias: '+ contact.U_Notes1 : null;
    return address;
  }

  function isClientFiscalDataValid(client){
    if(client && client.FiscalAddress){
      return client.LicTradNum && client.FiscalAddress.companyName && client.FiscalAddress.companyName != '';
    }
    return false;
  }

  function continueProcess(){
    //if(vm.quotation.Address && isClientFiscalDataValid(vm.client)){
    if(vm.quotation.Address){
      vm.isLoading = true;
      var params = angular.copy(vm.quotation);
      quotationService.update(vm.quotation.id, params).then(function(res){
        vm.isLoading = false;
        $location.path('/checkout/paymentmethod/' + vm.quotation.id);
      })
      .catch(function(err){
        console.log(err);
        dialogService.showDialog('Hubo un error: <br/>' + err);
      });
    }
    /*
    else if(!isClientFiscalDataValid(vm.client) ){
      dialogService.showDialog('Datos fiscales incompletos');
    }
    */
    else{
      dialogService.showDialog('Asigna una dirección de envío',function(){
        $location.path('/clients/profile/' + vm.quotation.Client.id)
          .search({
            activeTab:3,
            checkoutProcess: vm.quotation.id
          });
      });
    }
  }

  init();
}
