'use strict';

describe('Controller: SalesListCtrl', function () {

  // load the controller's module
  beforeEach(module('actualWebApp'));

  var SalesListCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SalesListCtrl = $controller('SalesListCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(SalesListCtrl.awesomeThings.length).toBe(3);
  });
});
