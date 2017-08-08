'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:DeliveryPolicyCtrl
 * @description
 * # DeliveryPolicyCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('DeliveryPolicyCtrl', function ($sce) {

		var vm = this;
		angular.extend(vm,{
			trustAsHtml: trustAsHtml
		});  	

	  function trustAsHtml(string) {
	    return $sce.trustAsHtml(string);
	  }
  });
