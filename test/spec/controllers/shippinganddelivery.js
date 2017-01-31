'use strict';

describe('Controller: ShippinganddeliveryCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var ShippinganddeliveryCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ShippinganddeliveryCtrl = $controller('ShippinganddeliveryCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ShippinganddeliveryCtrl.awesomeThings.length).toBe(3);
  });
});
