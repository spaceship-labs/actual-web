'use strict';

describe('Controller: CheckoutRefundsCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var CheckoutRefundsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CheckoutRefundsCtrl = $controller('CheckoutRefundsCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(CheckoutRefundsCtrl.awesomeThings.length).toBe(3);
  });
});
