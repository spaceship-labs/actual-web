'use strict';

/**
 * @ngdoc function
 * @name actualWebApp.controller:CheckoutClientCtrl
 * @description
 * # CheckoutClientCtrl
 * Controller of the actualWebApp
 */
angular
  .module('actualWebApp')
  .controller('CheckoutClientCtrl', CheckoutClientCtrl);

function CheckoutClientCtrl(
  commonService,
  clientService,
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
) {
  var vm = this;
  angular.extend(vm, {
    contacts: [],
    continueProcess: continueProcess,
    getContactName: getContactName,
    isClientFiscalDataValid: clientService.isClientFiscalDataValid
  });

  function init() {
    $rootScope.scrollTo('main');
    $location.search({});
    vm.isLoading = true;
    vm.isLoadingClient = true;
    vm.isLoadingContacts = true;

    quotationService
      .getById($routeParams.id)
      .then(function(res) {
        vm.quotation = res.data;
        vm.isLoading = false;
        return quotationService.validateQuotationStockById(vm.quotation.id);
      })
      .then(function(isValidStock) {
        if (!isValidStock) {
          //$location.path('/quotations/edit/' + vm.quotation.id)
          //  .search({stockAlert:true});
        }

        if (!vm.quotation.ZipcodeDelivery) {
          $location.path('/quotations/edit/' + vm.quotation.id);
        }

        if (!vm.quotation.Details || vm.quotation.Details.length === 0) {
          $location.path('/quotations/edit/' + vm.quotation.id);
        }

        if (vm.quotation.Order) {
          $location.path('/checkout/order/' + vm.quotation.Order.id);
        }

        if (vm.quotation.Client) {
          vm.isLoadingContacts = true;
          userService
            .getUserContacts()
            .then(function(res) {
              vm.isLoadingContacts = false;
              res = res || [];
              vm.contacts = res.map(function(contact) {
                contact.completeAdrress = clientService.buildAddressStringByContact(
                  contact
                );
                return contact;
              });
              console.log('get user contacts', vm.contacts);

              var isZipcodeDeliveryIsInContacts = checkIfZipcodeDeliveryIsInContacts(
                vm.quotation.ZipcodeDelivery,
                vm.contacts
              );
              // if (!isZipcodeDeliveryIsInContacts) {
              //   $location.path('/user/deliveries').search({
              //     returnTo: '/checkout/client/' + vm.quotation.id,
              //     quotationId: vm.quotation.id,
              //     addContact: true
              //   });

              /*
                var zipcodeMsg = 'Agrega una dirección de entrega con el código postal que seleccionaste';
                dialogService.showDialog(zipcodeMsg, function(){
                  $location.path('/user/deliveries')
                    .search({
                      returnTo: '/checkout/client/' + vm.quotation.id,
                      quotationId: vm.quotation.id
                    });
                });
                */
              // }

              if (vm.contacts.length > 0) {
                setSelectedContact(vm.contacts);
                console.log('vm.contacts', vm.contacts);
                vm.contacts = placeSelectedContactAtBeginning(vm.contacts);
              }
              /*
              if(vm.contacts.length > 0){
                vm.quotation.Address = vm.contacts[0].id;
              }
              */
            })
            .catch(function(err) {
              vm.isLoadingContacts = false;
              var error = err.data || err;
              console.log('err', err);
              error = error ? error.toString() : '';
              dialogService.showDialog('Hubo un error: ' + error);
            });
        }
      });
  }

  function checkIfZipcodeDeliveryIsInContacts(zipcodeDelivery, contacts) {
    if (!contacts || contacts.length === 0) {
      return false;
    }

    return _.some(contacts, function(contact) {
      return zipcodeDelivery.cp === contact.U_CP;
    });
  }

  function setSelectedContact(contacts) {
    var selectedZipcode = vm.quotation.ZipcodeDelivery.cp;
    var contactWithZipcodeMatch = _.findWhere(contacts, {
      U_CP: selectedZipcode
    });

    if (vm.quotation.Address) {
      if (contactWithZipcodeMatch) {
        vm.quotation.Address = contactWithZipcodeMatch.id;
      }
    } else {
      if (contactWithZipcodeMatch) {
        vm.quotation.Address = contactWithZipcodeMatch.id;
      } else {
        vm.quotation.Address = contacts[0].id;
      }
    }
  }

  function placeSelectedContactAtBeginning(contacts) {
    var selectedContactIndex = getSelectedContactIndexInContacts(
      vm.quotation.Address,
      contacts
    );
    var selectedContact = _.clone(contacts[selectedContactIndex]);
    console.log('selectedContact', selectedContact);
    console.log('selectedContactIndex', selectedContactIndex);

    contacts.splice(selectedContactIndex, 1);
    contacts.unshift(selectedContact);
    return contacts;
  }

  function getSelectedContactIndexInContacts(selectedContactId, contacts) {
    var index = -1;
    for (var i = 0; i < contacts.length; i++) {
      if (selectedContactId === contacts[i].id) {
        index = i;
      }
    }
    return index;
  }

  function getContactName(contact) {
    var name = '';
    if (contact.FirstName || contact.LastName) {
      name = contact.FirstName + ' ' + contact.LastName;
    } else {
      name = contact.Name;
    }
    return name;
  }

  function findContactById(id) {
    return _.findWhere(vm.contacts, { id: id });
  }

  function showInvoiceDataAlert(ev) {
    if ($rootScope.user.invited) {
      return $q.resolve(false);
    }

    var controller = InvoiceDialogController;
    var useFullScreen = $mdMedia('sm') || $mdMedia('xs');
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
      locals: {
        quotation: vm.quotation,
        client: vm.client
      }
    });
  }

  function continueProcess() {
    if (!vm.quotation.Details || vm.quotation.Details.length === 0) {
      dialogService.showDialog('No hay artículos en esta cotización');
      return;
    }

    vm.isLoading = true;
    $rootScope.scrollTo('main');
    vm.loadingEstimate = 0;
    var params = {
      paymentGroup: vm.quotation.paymentGroup || 1
    };
    console.log('params', params);
    return orderService
      .createFromQuotation(vm.quotation.id, params)
      .then(function(res) {
        vm.isLoading = false;
        console.log('respuesta funcion', res);

        dialogService.showDialog(
          'Su orden de compra ha sido recibida exitosamente, el personal de Ecommerce se pondrá en contacto con usted para concretar el pago de su orden. El horario de atención es de lunes a sábado de 8 a 20 horas y domingo de 8 a 15 horas.<br /><br />Gracias por su preferencia.',
          function() {
            $location.path('/');
          }
        );

        return;
      });
  }

  // console.log('vm.quotation.Address', vm.quotation.Address);

  // if (vm.quotation.Address && !vm.quotation.immediateDelivery) {
  //   var selectedContact = findContactById(vm.quotation.Address);

  //   console.log('vm.quotation.Address', selectedContact);
  //   if (!selectedContact.Address) {
  //     dialogService.showDialog('Agrega los datos de envio', function() {
  //       $location.path('/user/deliveries').search({
  //         returnTo: '/checkout/client/' + vm.quotation.id
  //       });
  //     });
  //     return;
  //   } else {
  //     vm.isLoading = true;
  //     $rootScope.scrollTo('main');
  //     var params = { addressId: vm.quotation.Address };
  //     quotationService
  //       .updateAddress(vm.quotation.id, params)
  //       .then(function(res) {
  //         vm.isLoading = false;
  //         $location.path('/checkout/paymentmethod/' + vm.quotation.id);
  //       })
  //       .catch(function(err) {
  //         console.log(err);
  //         var error = err.data || err;
  //         error = error ? error.toString() : '';
  //         dialogService.showDialog('Hubo un error: ' + error);
  //         vm.isLoading = false;
  //       });
  //   }
  // }

  // if (vm.quotation.Address || vm.quotation.immediateDelivery) {
  //   showInvoiceDataAlert()
  //     .then(function(goToPayments) {
  //       if (!goToPayments) {
  //         return $q.reject();
  //       }

  //       vm.isLoading = true;
  //       $rootScope.scrollTo('main');
  //       var params = { addressId: vm.quotation.Address };
  //       quotationService
  //         .updateAddress(vm.quotation.id, params)
  //         .then(function(res) {
  //           vm.isLoading = false;
  //           $location.path('/checkout/paymentmethod/' + vm.quotation.id);
  //         })
  //         .catch(function(err) {
  //           console.log(err);
  //           var error = err.data || err;
  //           error = error ? error.toString() : '';
  //           dialogService.showDialog('Hubo un error: ' + error);
  //           vm.isLoading = false;
  //         });
  //     })
  //     .catch(function(err) {
  //       console.log('err invoice alert', err);
  //     });
  // } else {
  //   dialogService.showDialog('Asigna una dirección de envío', function() {
  //     $location.path('/user/deliveries').search({
  //       returnTo: '/checkout/client/' + vm.quotation.id
  //     });
  //   });
  // }
  // }

  init();
}
