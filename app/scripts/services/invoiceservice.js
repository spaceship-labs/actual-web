(function() {
  angular
    .module('actualWebApp')
    .factory('invoiceService', invoiceService);

  function invoiceService(api) {
    return {
      create: create,
      find: find,
      send: send,
      getInvoiceLogs: getInvoiceLogs,
      sendFiscalData: sendFiscalData
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

    function sendFiscalData(email, name, form) {
      var params = {
        email: email,
        name: name,
        form: form
      };

      var url = '/sendfiscaldata';
      return api.$http.post(url, params).then(function(res) {
        return res.data;
      });
    }


    function getInvoiceLogs(orderID) {
      var url = '/order/invoicelogs/' + orderID;
      return api.$http.post(url).then(function(res) {
        return res.data;
      });
    }    
  }
})();
