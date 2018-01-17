'use strict';

describe('Controller: OurbrandsCtrl', function () {

  // load the controller's module
  beforeEach(module('actualWebApp'));

  var OurbrandsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    OurbrandsCtrl = $controller('OurbrandsCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(OurbrandsCtrl.awesomeThings.length).toBe(3);
  });
});
