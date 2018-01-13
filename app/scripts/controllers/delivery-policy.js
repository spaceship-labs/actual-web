'use strict';

/**
 * @ngdoc function
 * @name actualWebApp.controller:DeliveryPolicyCtrl
 * @description
 * # DeliveryPolicyCtrl
 * Controller of the actualWebApp
 */
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
