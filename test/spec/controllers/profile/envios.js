'use strict';

describe('Controller: ProfileEnviosCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var ProfileEnviosCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProfileEnviosCtrl = $controller('ProfileEnviosCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ProfileEnviosCtrl.awesomeThings.length).toBe(3);
  });
});
