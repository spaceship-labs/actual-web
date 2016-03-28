'use strict';

describe('Service: cateogriesService', function () {

  // load the service's module
  beforeEach(module('dashexampleApp'));

  // instantiate service
  var cateogriesService;
  beforeEach(inject(function (_cateogriesService_) {
    cateogriesService = _cateogriesService_;
  }));

  it('should do something', function () {
    expect(!!cateogriesService).toBe(true);
  });

});
