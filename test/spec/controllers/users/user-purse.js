'use strict';

describe('Controller: UsersUserPurseCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var UsersUserPurseCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UsersUserPurseCtrl = $controller('UsersUserPurseCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(UsersUserPurseCtrl.awesomeThings.length).toBe(3);
  });
});
