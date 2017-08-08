'use strict';

describe('Controller: SuggestionsCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var SuggestionsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SuggestionsCtrl = $controller('SuggestionsCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(SuggestionsCtrl.awesomeThings.length).toBe(3);
  });
});
