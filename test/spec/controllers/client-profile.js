'use strict';

describe('Controller: ClientProfileCtrl', function () {

  // load the controller's module
  beforeEach(module('actualWebApp'));

  var ClientProfileCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ClientProfileCtrl = $controller('ClientProfileCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ClientProfileCtrl.awesomeThings.length).toBe(3);
  });
});
