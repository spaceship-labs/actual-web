(function() {
  angular
    .module('dashexampleApp')
    .factory('invoiceService', invoiceService);

  function invoiceService(api) {
    return {
      create: create,
      find: find,
      send: send,
    };

    function create(orderID) {
      var url = '/invoice/create/';
      var params = { order: orderID };
      return api.$http.post(url, params).then(function(res) {
        return res.data;
      });
    }

    function find(orderID) {
      var url = '/invoice/find/';
      var params = { order: orderID };
      return api.$http.get(url, params).then(function(res) {
        return res.data;
      });
    }

    function send(orderID) {
      var url = '/invoice/send/';
      var params = { order: orderID };
      return api.$http.post(url, params).then(function(res) {
        return res.data;
      });
    }
  }
})();
