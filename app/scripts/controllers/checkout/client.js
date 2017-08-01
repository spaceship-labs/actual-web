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
  $q,
  $routeParams,
  $rootScope, 
  $location,
  $mdDialog,
  $mdMedia,
  categoriesService,
  productService,
  quotationService,
  orderService,
  dialogService,
  userService
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
    vm.isLoadingClient = true;
    vm.isLoadingContacts = true;
    $rootScope.scrollTo('main');    

    quotationService.getById($routeParams.id)
      .then(function(res){
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

          vm.isLoadingContacts = true;
          userService.getUserContacts()
            .then(function(res){
              vm.isLoadingContacts = false;
              res = res || [];
              vm.contacts = res.map(function(contact){
                contact.completeAdrress = clientService.buildAddressStringByContact(contact);
                return contact;
              });
              if(!vm.quotation.Address && vm.contacts.length > 0){
                vm.quotation.Address = vm.contacts[0].id;
              }
            })
            .catch(function(err){
              vm.isLoadingContacts = false;
              var error = err.data || err;
              console.log('err', err);
              error = error ? error.toString() : '';
              dialogService.showDialog('Hubo un error: ' + error );

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

  function findContactById(id){
    return _.findWhere(vm.contacts, {id: id});
  }

  function showInvoiceDataAlert(ev){
    var controller = InvoiceDialogController;
    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
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
        client: vm.client
      }
    });
  }

  function continueProcess(){
    if(!vm.quotation.Details || vm.quotation.Details.length === 0){
      dialogService.showDialog('No hay artículos en esta cotización');
      return;
    }

    console.log('vm.quotation.Address', vm.quotation.Address);

    if(vm.quotation.Address && !vm.quotation.immediateDelivery){
      var selectedContact = findContactById(vm.quotation.Address);
      
      console.log('vm.quotation.Address', selectedContact);
      if(!selectedContact.Address){
        dialogService.showDialog('Agrega los datos de envio',function(){
          $location.path('/user/deliveries')
            .search({
              returnTo: '/checkout/client/' + vm.quotation.id
            });
        });
        return;
      }
    }

    /*TODO: Remove true*/
    if( vm.quotation.Address || vm.quotation.immediateDelivery || true){

      showInvoiceDataAlert()
        .then(function(goToPayments){
          if(!goToPayments){
            return $q.reject();
          }
          vm.isLoading = true;
          $rootScope.scrollTo('main');
          var params = {addressId: vm.quotation.Address};
          return quotationService.updateAddress(vm.quotation.id, params);
        })
        .then(function(res){
          vm.isLoading = false;
          $location.path('/checkout/paymentmethod/' + vm.quotation.id);
        })
        .catch(function(err){
          console.log(err);
          var error = err.data || err;
          error = error ? error.toString() : '';
          dialogService.showDialog('Hubo un error: ' + error );
        });

    }

    else{
      dialogService.showDialog('Asigna una dirección de envío',function(){
        $location.path('/user/deliveries')
          .search({
            returnTo: '/checkout/client/' + vm.quotation.id
          });
      });
    }
  }

  init();
}
