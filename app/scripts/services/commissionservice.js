(function (){
  'use strict';

  angular
    .module('dashexampleApp')
    .factory('commissionService', commissionService);

  function commissionService(api) {
    return {
      getCommissions: getCommissions
    };

    function getCommissions(page, params) {
      var url = '/commission/find';
      return api.$http.post(url, params);
    }
  }
})();
