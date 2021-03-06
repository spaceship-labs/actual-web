'use strict';

describe('Directive: offersDirective', function () {

  // load the directive's module
  beforeEach(module('actualWebApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<offers-directive></offers-directive>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the offersDirective directive');
  }));
});
