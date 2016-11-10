'use strict';

describe('Controller: WarrantyPolicyCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var WarrantyPolicyCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    WarrantyPolicyCtrl = $controller('WarrantyPolicyCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(WarrantyPolicyCtrl.awesomeThings.length).toBe(3);
  });
});
