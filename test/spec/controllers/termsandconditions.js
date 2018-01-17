'use strict';

describe('Controller: TermsandconditionsCtrl', function () {

  // load the controller's module
  beforeEach(module('actualWebApp'));

  var TermsandconditionsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TermsandconditionsCtrl = $controller('TermsandconditionsCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(TermsandconditionsCtrl.awesomeThings.length).toBe(3);
  });
});
