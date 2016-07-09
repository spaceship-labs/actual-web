'use strict';

describe('Controller: ContinuequotationCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var ContinuequotationCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ContinuequotationCtrl = $controller('ContinuequotationCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ContinuequotationCtrl.awesomeThings.length).toBe(3);
  });
});
