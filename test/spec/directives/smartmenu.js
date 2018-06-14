'use strict';

describe('Directive: smartMenu', function () {

  // load the directive's module
  beforeEach(module('actualWebApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<smart-menu></smart-menu>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the smartMenu directive');
  }));
});
