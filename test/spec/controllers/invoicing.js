'use strict';

describe('Controller: InvoicingCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var InvoicingCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    InvoicingCtrl = $controller('InvoicingCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(InvoicingCtrl.awesomeThings.length).toBe(3);
  });
});
