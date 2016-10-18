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
          vm.contacts = formatContacts(res.data);
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

  function formatContacts(contacts){
    var formattedContacts = [];
    if(contacts){
      formattedContacts = contacts.map(function(c){
        c.name = (c.firstName&&c.lastName) ? c.firstName+' '+c.lastName : c.name;
        c.address = c.address;
        c.phone = c.phone || c.Tel1;
        c.mobile = c.mobilePhone || c.Cellolar;
        return c;
      });
    }
    return formattedContacts;
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
