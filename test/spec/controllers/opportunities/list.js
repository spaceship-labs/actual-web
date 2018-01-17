'use strict';

describe('Controller: OpportunitiesListCtrl', function () {

  // load the controller's module
  beforeEach(module('actualWebApp'));

  var OpportunitiesListCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    OpportunitiesListCtrl = $controller('OpportunitiesListCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(OpportunitiesListCtrl.awesomeThings.length).toBe(3);
  });
});
