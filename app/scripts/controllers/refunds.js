'use strict';

/**
 * @ngdoc function
 * @name actualWebApp.controller:CheckoutPaymentmethodCtrl
 * @description
 * # CheckoutPaymentmethodCtrl
 * Controller of the actualWebApp
 */
angular.module('actualWebApp')
  .controller('CheckoutRefundsCtrl', CheckoutRefundsCtrl);

function CheckoutRefundsCtrl(
    $routeParams,
    $rootScope,
    orderService,
    paymentService
){
	var vm = this;
	angular.extend(vm, {});

	function init(){
		vm.isLoading = true;
		orderService.getById($routeParams.id).then(function(res){	
			console.log('order', res.data);
			vm.isLoading = false;
			vm.order = res.data;
			if(vm.order.id) {
				vm.refundOptions = paymentService.getRefundsOptions();
				console.log('refundOptions', vm.refundOptions);
			}
		});	
	}

	init();

}