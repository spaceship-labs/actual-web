'use strict';

describe('Controller: RefundsPaymentsCtrl', function () {

  // load the controller's module
  beforeEach(module('actualWebApp'));

  var RefundsPaymentsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    RefundsPaymentsCtrl = $controller('RefundsPaymentsCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(RefundsPaymentsCtrl.awesomeThings.length).toBe(3);
  });
});
