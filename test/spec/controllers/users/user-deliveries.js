'use strict';

describe('Controller: UsersUserDeliveriesCtrl', function () {

  // load the controller's module
  beforeEach(module('actualWebApp'));

  var UsersUserDeliveriesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UsersUserDeliveriesCtrl = $controller('UsersUserDeliveriesCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(UsersUserDeliveriesCtrl.awesomeThings.length).toBe(3);
  });
});
