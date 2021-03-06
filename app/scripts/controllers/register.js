'use strict';
angular.module('actualWebApp').controller('RegisterCtrl', RegisterCtrl);

function RegisterCtrl(
  authService,
  clientService,
  dialogService,
  quotationService,
  commonService,
  $rootScope,
  $routeParams,
  $location,
  $q
) {
  var vm = this;
  angular.extend(vm, {
    init: init,
    register: register,
    isCheckoutProcessActive: false,
    copyDeliveryDataToPersonalData: copyDeliveryDataToPersonalData,
    newClient: {},
    phonePattern: '.*\\d{10}$'
  });

  init();

  function init() {
    if ($routeParams.addContact) {
      vm.isContactCreateActive = true;
      vm.newAddress = {};

      if ($routeParams.quotation) {
        vm.isCheckoutProcessActive = true;
        console.log('quotation');
        loadStates();
        return;
      }
    }

    vm.newClient.invited = false;
  }

  function loadStates() {
    commonService
      .getStatesSap()
      .then(function(res) {
        console.log(res);
        vm.states = res.data;
        loadZipcodeDelivery($routeParams.quotation);
      })
      .catch(function(err) {
        console.log(err);
      });
  }

  function loadZipcodeDelivery(quotationId) {
    quotationService
      .getQuotationZipcodeDelivery(quotationId)
      .then(function(res) {
        vm.zipcodeDelivery = res;
        vm.newAddress.U_CP = vm.zipcodeDelivery.cp;
        vm.newAddress.U_Mpio = vm.zipcodeDelivery.municipio;
        vm.newAddress.U_Estado = getStateCodeByZipcodeDelivery(
          vm.zipcodeDelivery
        );
        console.log('vm.newAddress', vm.newAddress);
        console.log('vm.zipcodedelivery', vm.zipcodeDelivery);
      })
      .catch(function(err) {
        console.log('err', err);
      });
  }

  function getStateCodeByZipcodeDelivery(zipcodeDelivery) {
    var zipcodeStateName = zipcodeDelivery.estado.toUpperCase();
    console.log('zipcodeStateName', zipcodeStateName);
    var stateItem = _.find(vm.states, function(state) {
      var stateName = state.Name.toUpperCase();
      return stateName === zipcodeStateName;
    });
    var stateCode = stateItem ? stateItem.Code : false;
    console.log('stateItem', stateItem);
    return stateCode;
  }

  function copyDeliveryDataToPersonalData(client, contact) {
    if (!contact.copyingPersonalData) {
      client.FirstName = _.clone(contact.FirstName);
      client.LastName = _.clone(contact.LastName);
      client.Phone1 = _.clone(contact.Tel1);
      client.Cellular = _.clone(contact.Cellolar);
      client.E_Mail = _.clone(contact.E_Mail);
      contact._email = _.clone(contact._email);
    } else {
      delete client.FirstName;
      delete client.LastName;
      delete client.Tel1;
      delete client.Cellolar;
      delete client.E_Mail;
      delete client._email;
    }
  }

  function register(form) {
    console.log('register');
    var createdClient;
    var createdUser;

    if (form.$valid) {
      vm.isLoading = true;

      $rootScope.scrollTo('main');

      if (vm.newAddress && vm.newAddress.Address) {
        vm.newClient.contacts = [vm.newAddress];
      }
      if (vm.newClient.invited) vm.newClient.password = generatePassword();
      clientService
        .register(vm.newClient)
        .then(function(res) {
          console.log('res', res);
          res = res || {};
          createdClient = res.client;
          createdUser = res.user;

          if (!$routeParams.addContact) {
            dialogService.showDialog('Usuario registrado con éxito');
          }
          //vm.isLoading = false;
          //vm.registerDone = true;

          var formData = {
            email: createdUser.email,
            password: vm.newClient.password
          };

          var handleSignInError = function(err) {
            console.log('err', err);
            dialogService.showDialog('Error al iniciar sesión');
          };

          return authService.signIn(
            formData,
            $rootScope.successAuthInCheckout,
            handleSignInError
          );
        })
        .then(function() {
          console.log('termino authService');

          if ($routeParams.quotation) {
            var quotationId = $routeParams.quotation;
            var params = {
              Client: createdClient.id,
              UserWeb: createdUser.id
            };
            if (createdClient.Contacts && createdClient.Contacts.length > 0) {
              params.Address = createdClient.Contacts[0].id;
            }
            return quotationService.update(quotationId, params);
          } else {
            var deferred = $q.defer();
            return deferred.resolve();
          }
        })
        .then(function(updated) {
          if (updated) {
            //dialogService.showDialog('Registrado con exito');
            $location.path('/checkout/client/' + $routeParams.quotation);
          } else {
            $location.path('/');
          }
        })
        .catch(function(err) {
          vm.isLoading = false;
          var errMsg = err.data || err;

          if (typeof errMsg !== 'string') {
            errMsg = JSON.stringify(errMsg);
          }

          console.log('err', err);
          dialogService.showDialog('Hubo un error, revisa tus datos ' + errMsg);
        });
    } else {
      dialogService.showDialog('Campos incompletos, revisa tus datos');
    }
  }

  function generatePassword() {
    var length = 8,
      charset =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      retVal = '';
    for (var i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  }
}

RegisterCtrl.$inject = [
  'authService',
  'clientService',
  'dialogService',
  'quotationService',
  'commonService',
  '$rootScope',
  '$routeParams',
  '$location',
  '$q'
];
