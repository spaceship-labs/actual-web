'use strict';

describe('Controller: ProfileUserDeliveriesCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var ProfileUserDeliveriesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProfileUserDeliveriesCtrl = $controller('ProfileUserDeliveriesCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ProfileUserDeliveriesCtrl.awesomeThings.length).toBe(3);
  });
});
