function InvoiceDialogController(
  $scope,
  $mdDialog,
  $location,
  quotation,
  client
) {
  $scope.continue = function() {
    $mdDialog.hide(true);
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

  $scope.modify = function() {
    console.log('modify');
    $location.path('/user/invoices/').search({
      checkoutProcess: quotation.id,
      returnTo: '/checkout/paymentmethod/' + quotation.id
    });
    $mdDialog.hide(false);
  };
}
