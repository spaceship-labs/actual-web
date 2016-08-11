'use strict';

describe('Service: packageService', function () {

  // load the service's module
  beforeEach(module('dashexampleApp'));

  // instantiate service
  var packageService;
  beforeEach(inject(function (_packageService_) {
    packageService = _packageService_;
  }));

  it('should do something', function () {
    expect(!!packageService).toBe(true);
  });

});
