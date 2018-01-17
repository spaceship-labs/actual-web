'use strict';

describe('Controller: UsersUserPurchasesCtrl', function () {

  // load the controller's module
  beforeEach(module('actualWebApp'));

  var UsersUserPurchasesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UsersUserPurchasesCtrl = $controller('UsersUserPurchasesCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(UsersUserPurchasesCtrl.awesomeThings.length).toBe(3);
  });
});
