'use strict';

describe('Controller: ReportsQuotationsCtrl', function () {

  // load the controller's module
  beforeEach(module('actualWebApp'));

  var ReportsQuotationsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ReportsQuotationsCtrl = $controller('ReportsQuotationsCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ReportsQuotationsCtrl.awesomeThings.length).toBe(3);
  });
});
