'use strict';

describe('Controller: ClientsListCtrl', function () {

  // load the controller's module
  beforeEach(module('actualWebApp'));

  var ClientsListCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ClientsListCtrl = $controller('ClientsListCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ClientsListCtrl.awesomeThings.length).toBe(3);
  });
});
