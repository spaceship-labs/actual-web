'use strict';

describe('Controller: UsersInvoicesCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var UsersInvoicesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UsersInvoicesCtrl = $controller('UsersInvoicesCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(UsersInvoicesCtrl.awesomeThings.length).toBe(3);
  });
});
