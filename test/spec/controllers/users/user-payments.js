'use strict';

describe('Controller: UsersUserPaymentsCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var UsersUserPaymentsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UsersUserPaymentsCtrl = $controller('UsersUserPaymentsCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(UsersUserPaymentsCtrl.awesomeThings.length).toBe(3);
  });
});
