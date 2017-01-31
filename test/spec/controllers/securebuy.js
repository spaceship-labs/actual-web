'use strict';

describe('Controller: SecurebuyCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var SecurebuyCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SecurebuyCtrl = $controller('SecurebuyCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(SecurebuyCtrl.awesomeThings.length).toBe(3);
  });
});
