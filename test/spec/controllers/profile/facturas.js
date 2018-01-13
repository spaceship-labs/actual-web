'use strict';

describe('Controller: ProfileFacturasCtrl', function () {

  // load the controller's module
  beforeEach(module('actualWebApp'));

  var ProfileFacturasCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProfileFacturasCtrl = $controller('ProfileFacturasCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ProfileFacturasCtrl.awesomeThings.length).toBe(3);
  });
});
