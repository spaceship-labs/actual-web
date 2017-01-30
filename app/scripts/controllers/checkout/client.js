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
    getContactName: getContactName,
    isClientFiscalDataValid: clientService.isClientFiscalDataValid
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

      if(!vm.quotation.Details || vm.quotation.Details.length === 0){
        $location.path('/quotations/edit/' + vm.quotation.id);
      }

      if(vm.quotation.Order){
        $location.path('/checkout/order/' + vm.quotation.Order.id);
      }

      if(vm.quotation.Client){
        clientService.getById(vm.quotation.Client.id)
          .then(function(res){
            vm.client = res.data;
            vm.contacts = vm.client.Contacts.map(function(contact){
              contact.completeAdrress = clientService.buildAddressStringByContact(contact);
              return contact;
            });
            if(!vm.quotation.Address && vm.contacts.length > 0){
              vm.quotation.Address = vm.contacts[0].id;
            }            
          });
      }
      
    });
  }

  function getContactName(contact){
    var name = '';
    if(contact.FirstName || contact.LastName){
      name = contact.FirstName + ' ' + contact.LastName;
    }else{
      name = contact.Name
    }
    return name;
  }

  function continueProcess(){
    if(!vm.quotation.Details || vm.quotation.Details.length === 0){
      dialogService.showDialog('No hay aritculos en esta cotización');
      return;
    }
    
    if(vm.quotation.Address || vm.quotation.immediateDelivery){
      vm.isLoading = true;
      var params = {Address: vm.quotation.Address};
      quotationService.update(vm.quotation.id, params).then(function(res){
        vm.isLoading = false;
        $location.path('/checkout/paymentmethod/' + vm.quotation.id);
      })
      .catch(function(err){
        console.log(err);
        dialogService.showDialog('Hubo un error: <br/>' + err);
      });
    }
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
