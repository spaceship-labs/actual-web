'use strict';

describe('Controller: CheckoutClientCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var CheckoutClientCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CheckoutClientCtrl = $controller('CheckoutClientCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(CheckoutClientCtrl.awesomeThings.length).toBe(3);
  });
});
