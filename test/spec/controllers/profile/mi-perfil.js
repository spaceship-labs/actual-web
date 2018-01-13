'use strict';

describe('Controller: ProfileMiPerfilCtrl', function () {

  // load the controller's module
  beforeEach(module('actualWebApp'));

  var ProfileMiPerfilCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProfileMiPerfilCtrl = $controller('ProfileMiPerfilCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ProfileMiPerfilCtrl.awesomeThings.length).toBe(3);
  });
});
