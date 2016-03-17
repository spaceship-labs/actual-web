'use strict';

describe('Controller: ListingCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var ListingCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ListingCtrl = $controller('ListingCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ListingCtrl.awesomeThings.length).toBe(3);
  });
});
