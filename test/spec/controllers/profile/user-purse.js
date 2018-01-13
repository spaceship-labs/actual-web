'use strict';

describe('Controller: ProfileUserPurseCtrl', function () {

  // load the controller's module
  beforeEach(module('actualWebApp'));

  var ProfileUserPurseCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProfileUserPurseCtrl = $controller('ProfileUserPurseCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ProfileUserPurseCtrl.awesomeThings.length).toBe(3);
  });
});
