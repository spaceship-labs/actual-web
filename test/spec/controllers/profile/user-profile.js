'use strict';

describe('Controller: ProfileUserProfileCtrl', function () {

  // load the controller's module
  beforeEach(module('actualWebApp'));

  var ProfileUserProfileCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProfileUserProfileCtrl = $controller('ProfileUserProfileCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ProfileUserProfileCtrl.awesomeThings.length).toBe(3);
  });
});
