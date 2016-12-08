'use strict';

describe('Controller: ProfileUserPaymentsCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var ProfileUserPaymentsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProfileUserPaymentsCtrl = $controller('ProfileUserPaymentsCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ProfileUserPaymentsCtrl.awesomeThings.length).toBe(3);
  });
});
