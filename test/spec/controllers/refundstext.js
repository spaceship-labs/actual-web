'use strict';

describe('Controller: RefundstextCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var RefundstextCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    RefundstextCtrl = $controller('RefundstextCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(RefundstextCtrl.awesomeThings.length).toBe(3);
  });
});
