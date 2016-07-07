'use strict';

describe('Controller: CheckoutPaymentmethodCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var CheckoutPaymentmethodCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CheckoutPaymentmethodCtrl = $controller('CheckoutPaymentmethodCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(CheckoutPaymentmethodCtrl.awesomeThings.length).toBe(3);
  });
});
