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

function CheckoutClientCtrl(commonService, clientService ,$timeout ,$routeParams, $rootScope, $location ,categoriesService, productService, quotationService, orderService){
  var vm = this;
  angular.extend(vm,{
    continueProcess: continueProcess,
    formatContacts: formatContacts,
    init: init,
  });

  function init(){
    vm.isLoading = true;
    quotationService.getById($routeParams.id).then(function(res){
      vm.quotation = res.data;
      vm.isLoading = false;

      if(vm.quotation.Order){
        $location.path('/checkout/order/' + vm.quotation.Order);
      }

      //fillin address data with client info
      quotationService.getQuotationProducts(vm.quotation).then(function(details){
        console.log(details);
        vm.quotation.Details = details;
      });

      if(vm.quotation.Client){
        clientService.getContacts(vm.quotation.Client.CardCode).then(function(res){
          vm.contacts = vm.formatContacts(res.data);
          if(!vm.quotation.Address && vm.contacts.length > 0){
            vm.quotation.Address = vm.contacts[0].id;
            console.log('No habia direccion');
          }

          console.log(res);
          //vm.contacts = contacts;
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
        c.phone = (c.phone) ? c.dialCode + ' ' + c.phone : c.phone1;
        c.mobile = (c.mobilePhone) ? c.mobileDialCode + ' ' + c.mobilePhone : c.mobileSAP;
        return c;
      });
    }
    return formattedContacts;
  }

  function continueProcess(){
    console.log('continueProcess');
    vm.isLoading = true;
    var params = angular.copy(vm.quotation);
    //delete params.Details;

    if(params.Details){
      params.Details = params.Details.map(function(detail){
        detail.Product = detail.Product.id;
        return detail;
      });
    }

    quotationService.update(vm.quotation.id, params).then(function(res){
      vm.isLoading = false;
      $location.path('/checkout/paymentmethod/' + vm.quotation.id);
    });
  }


  vm.init();

}
