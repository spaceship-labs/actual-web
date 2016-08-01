'use strict';

describe('Service: storeService', function () {

  // load the service's module
  beforeEach(module('dashexampleApp'));

  // instantiate service
  var storeService;
  beforeEach(inject(function (_storeService_) {
    storeService = _storeService_;
  }));

  it('should do something', function () {
    expect(!!storeService).toBe(true);
  });

});
