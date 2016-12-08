'use strict';

describe('Controller: ProfileUserInvoicesCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var ProfileUserInvoicesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProfileUserInvoicesCtrl = $controller('ProfileUserInvoicesCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ProfileUserInvoicesCtrl.awesomeThings.length).toBe(3);
  });
});
