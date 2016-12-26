'use strict';

describe('Controller: CheckoutPaymentInfoCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var CheckoutPaymentInfoCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CheckoutPaymentInfoCtrl = $controller('CheckoutPaymentInfoCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(CheckoutPaymentInfoCtrl.awesomeThings.length).toBe(3);
  });
});
