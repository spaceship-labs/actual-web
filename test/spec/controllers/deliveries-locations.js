'use strict';

describe('Controller: DeliveriesLocationsCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var DeliveriesLocationsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DeliveriesLocationsCtrl = $controller('DeliveriesLocationsCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(DeliveriesLocationsCtrl.awesomeThings.length).toBe(3);
  });
});
