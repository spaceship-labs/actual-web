'use strict';

describe('Controller: DeliveryPolicyCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var DeliveryPolicyCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DeliveryPolicyCtrl = $controller('DeliveryPolicyCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(DeliveryPolicyCtrl.awesomeThings.length).toBe(3);
  });
});