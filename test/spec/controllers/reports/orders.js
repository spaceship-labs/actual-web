'use strict';

describe('Controller: ReportsOrdersCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var ReportsOrdersCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ReportsOrdersCtrl = $controller('ReportsOrdersCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ReportsOrdersCtrl.awesomeThings.length).toBe(3);
  });
});
