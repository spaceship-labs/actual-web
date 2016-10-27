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
  });

  function init(){
    vm.isLoading = true;
    quotationService.getById($routeParams.id).then(function(res){
      vm.quotation = res.data;
      vm.isLoading = false;
      return quotationService.getCurrentStock(vm.quotation.id); 
    })
    .then(function(response){
      var quotationDetailsStock = response.data;
      if( !quotationService.isValidStock(quotationDetailsStock) ){
        $location.path('/quotations/edit/' + vm.quotation.id)
          .search({stockAlert:true});
      }

      if(vm.quotation.Order){
        $location.path('/checkout/order/' + vm.quotation.Order.id);
      }

      if(vm.quotation.Client){
        clientService.getContacts(vm.quotation.Client.CardCode).then(function(res){
          vm.contacts = res.data;
          vm.contacts = vm.contacts.map(function(c){
            c.completeAdrress = buildAddress(c);
            return c;
          });
          if(!vm.quotation.Address && vm.contacts.length > 0){
            vm.quotation.Address = vm.contacts[0].id;
            console.log('No habia direccion');
          }
        })
        .catch(function(err){
          console.log(err);
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
    address += contact.U_Colonia ? ', colonia: '+ contact.U_Colonia : null;
    address += contact.U_Mpio ? ', municipio: '+ contact.U_Mpio : null;
    address += contact.U_Ciudad ? ', ciudad: '+ contact.U_Ciudad : null;
    address += contact.U_Estado ? ', estado: '+ contact.U_Estado : null;
    address += contact.U_CP ? ', código postal: '+ contact.U_CP : null;
    address += contact.U_Estado ? ', estado: '+ contact.U_Estado : null;
    address += contact.U_Entrecalle ? ', entre calle: '+ contact.U_Entrecalle : null;
    address += contact.U_Ycalle ? ' y calle: '+ contact.U_Ycalle : null;
    address += contact.U_Notes1 ? ', referencias: '+ contact.U_Notes1 : null;
    console.log('address',address)
    return address;
  }

  function continueProcess(){
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

  init();
}
