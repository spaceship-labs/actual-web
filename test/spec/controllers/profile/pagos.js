'use strict';

describe('Controller: ProfilePagosCtrl', function () {

  // load the controller's module
  beforeEach(module('actualWebApp'));

  var ProfilePagosCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProfilePagosCtrl = $controller('ProfilePagosCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ProfilePagosCtrl.awesomeThings.length).toBe(3);
  });
});
