'use strict';

describe('Controller: RefundsProductsCtrl', function () {

  // load the controller's module
  beforeEach(module('actualWebApp'));

  var RefundsProductsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    RefundsProductsCtrl = $controller('RefundsProductsCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(RefundsProductsCtrl.awesomeThings.length).toBe(3);
  });
});
