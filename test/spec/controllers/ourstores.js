'use strict';

describe('Controller: OurstoresCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var OurstoresCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    OurstoresCtrl = $controller('OurstoresCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(OurstoresCtrl.awesomeThings.length).toBe(3);
  });
});
