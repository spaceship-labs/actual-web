'use strict';

describe('Controller: StoragePolicyCtrl', function () {

  // load the controller's module
  beforeEach(module('actualWebApp'));

  var StoragePolicyCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    StoragePolicyCtrl = $controller('StoragePolicyCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(StoragePolicyCtrl.awesomeThings.length).toBe(3);
  });
});
