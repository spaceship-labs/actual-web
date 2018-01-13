'use strict';

describe('Controller: CommissionsListCtrl', function () {

  // load the controller's module
  beforeEach(module('actualWebApp'));

  var CommissionsListCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CommissionsListCtrl = $controller('CommissionsListCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(CommissionsListCtrl.awesomeThings.length).toBe(3);
  });
});
