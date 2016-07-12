'use strict';

describe('Controller: CheckoutOrderCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var CheckoutOrderCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CheckoutOrderCtrl = $controller('CheckoutOrderCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(CheckoutOrderCtrl.awesomeThings.length).toBe(3);
  });
});
