'use strict';

describe('Controller: CreateClientCtrl', function () {

  // load the controller's module
  beforeEach(module('actualWebApp'));

  var CreateClientCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CreateClientCtrl = $controller('CreateClientCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(CreateClientCtrl.awesomeThings.length).toBe(3);
  });
});
