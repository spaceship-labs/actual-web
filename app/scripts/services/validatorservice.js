(function () {
  'use strict';

  angular
    .module('actualWebApp')
    .factory('validatorService', validatorService);

  /** @ngInject */
  function validatorService() {
    var service = {
      validateRegister: validateRegister,
    };
    return service;

    function validateRegister(form) {
      const errors = form.$error.pattern;
      const models = {
        "vm.newAddress.Cellolar": "Número telefonico(10 dígitos) de la sección de envío",
        "vm.newAddress.FirstName": "Nombre de la sección de envío",
        "vm.newAddress.LastName": "Apellidos de la sección de envío",
        "vm.newAddress.E_Mail": "Correo electrónico de la sección de envío",
        "vm.newAddress.Address": "Calle de la sección de envío",
        "vm.newAddress.U_Noexterior": "Número exterior de la sección de envío",
        "vm.newAddress.U_Nointerior": "Número interior de la sección de envío",
        "vm.newAddress.U_Colonia": "Colonia de la sección de envío",
        "vm.newAddress.U_Mpio": "Municipio de la sección de envío",
        "vm.newAddress.U_Ciudad": "Ciudad de la sección de envío",
        "vm.newAddress.U_Estado": "Estado de la sección de envío",
        "vm.newAddress.U_CP": "Código Postal de la sección de envío",
        "vm.newClient.FirstName": "Nombre de la sección de datos personales",
        "vm.newClient.LastName": "Apellidos de la sección de datos personales",
        "vm.newClient.E_Mail": "Correo eléctronico de la sección de datos personales",
        "vm.newClient._E_Mail": "Confirmación del correo eléctronico de la sección de datos personales",
        "vm.newClient.Cellular": "Número celular(10 dígitos) de la sección de datos personales",
        "vm.newClient._password": "Confirmación de la contraseña",
      };
      var customError = errors.reduce(function (acum, error) {
        const value = error.$$lastCommittedViewValue;
        const field = models[error.$$attr.ngModel];
        const msg = "Revisa tu(s): " + field + "<br/>";
        return acum + msg;
      }, '');

      return customError;

    }

  }
})();
