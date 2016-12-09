'use strict';

describe('Controller: UsersUserInvoicesCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var UsersUserInvoicesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UsersUserInvoicesCtrl = $controller('UsersUserInvoicesCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(UsersUserInvoicesCtrl.awesomeThings.length).toBe(3);
  });
});
