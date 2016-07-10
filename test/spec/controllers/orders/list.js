'use strict';

describe('Controller: OrdersListCtrl', function () {

  // load the controller's module
  beforeEach(module('dashexampleApp'));

  var OrdersListCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    OrdersListCtrl = $controller('OrdersListCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(OrdersListCtrl.awesomeThings.length).toBe(3);
  });
});
