'use strict';
angular.module('actualWebApp')
  .controller('DeliveryPolicyCtrl', function ($sce) {
		var vm = this;
		angular.extend(vm,{
			trustAsHtml: trustAsHtml
		});  	

	  function trustAsHtml(string) {
	    return $sce.trustAsHtml(string);
	  }
  });
