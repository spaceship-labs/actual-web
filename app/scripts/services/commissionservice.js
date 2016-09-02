(function (){
  'use strict';

  angular
    .module('dashexampleApp')
    .factory('commissionService', commissionService);

  function commissionService(api) {
    return {
      getCommissions: getCommissions,
      getTotalByUser: getTotalByUser
    };

    function getCommissions(page, params) {
      var url = '/commission/find';
      return api.$http.post(url, params);
    }

    function getTotalByUser(user, dateFrom, dateTo) {
      var url    = '/commission/total';
      var params = {
        user: user,
        dateFrom: dateFrom,
        dateTo: dateTo
      };
      return api.$http.post(url, params).then(function(res) {
        return res.data;
      });
    }
  }
})();
