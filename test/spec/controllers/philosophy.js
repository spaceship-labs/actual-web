'use strict';

describe('Controller: PhilosophyCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var PhilosophyCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PhilosophyCtrl = $controller('PhilosophyCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(PhilosophyCtrl.awesomeThings.length).toBe(3);
  });
});
