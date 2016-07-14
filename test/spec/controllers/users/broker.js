'use strict';

describe('Controller: UsersBrokerCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var UsersBrokerCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UsersBrokerCtrl = $controller('UsersBrokerCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(UsersBrokerCtrl.awesomeThings.length).toBe(3);
  });
});
