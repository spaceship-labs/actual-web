'use strict';

describe('Service: companyService', function () {

  // load the service's module
  beforeEach(module('dashexampleApp'));

  // instantiate service
  var companyService;
  beforeEach(inject(function (_companyService_) {
    companyService = _companyService_;
  }));

  it('should do something', function () {
    expect(!!companyService).toBe(true);
  });

});
