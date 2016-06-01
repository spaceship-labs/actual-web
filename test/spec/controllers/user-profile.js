'use strict';

describe('Controller: UserProfileCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var UserProfileCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UserProfileCtrl = $controller('UserProfileCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(UserProfileCtrl.awesomeThings.length).toBe(3);
  });
});
