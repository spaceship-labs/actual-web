'use strict';

describe('Controller: PaymentmethodsCtrl', function () {

  // load the controller's module
  beforeEach(module('actualWebApp'));

  var PaymentmethodsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PaymentmethodsCtrl = $controller('PaymentmethodsCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(PaymentmethodsCtrl.awesomeThings.length).toBe(3);
  });
});
