'use strict';

describe('Controller: EnsamblePolicyCtrl', function () {

  // load the controller's module
  beforeEach(module('actualWebApp'));

  var EnsamblePolicyCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EnsamblePolicyCtrl = $controller('EnsamblePolicyCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(EnsamblePolicyCtrl.awesomeThings.length).toBe(3);
  });
});
