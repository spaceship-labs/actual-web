'use strict';

describe('Controller: ProfileMonederoCtrl', function () {

  // load the controller's module
  beforeEach(module('actualWebApp'));

  var ProfileMonederoCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProfileMonederoCtrl = $controller('ProfileMonederoCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ProfileMonederoCtrl.awesomeThings.length).toBe(3);
  });
});
