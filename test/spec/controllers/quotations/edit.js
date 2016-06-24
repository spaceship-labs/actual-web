'use strict';

describe('Controller: QuotationsEditCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var QuotationsEditCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    QuotationsEditCtrl = $controller('QuotationsEditCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(QuotationsEditCtrl.awesomeThings.length).toBe(3);
  });
});
