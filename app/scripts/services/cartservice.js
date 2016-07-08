(function (){
  'use strict';

  angular
    .module('dashexampleApp')
    .factory('cartService', cartService);

  function cartService($rootScope, $location ,localStorageService, quotationService){
    var service = {    };

    return service;


  }

})();
