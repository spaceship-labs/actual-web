'use strict';

describe('Service: cartService', function () {

  // load the service's module
  beforeEach(module('actualWebApp'));

  // instantiate service
  var cartService;
  beforeEach(inject(function (_cartService_) {
    cartService = _cartService_;
  }));

  it('should do something', function () {
    expect(!!cartService).toBe(true);
  });

});
