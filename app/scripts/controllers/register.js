'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:RegisterCtrl
 * @description
 * # RegisterCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('RegisterCtrl', RegisterCtrl);

function RegisterCtrl(
	userService,
	dialogService
){
	var vm = this;
	angular.extend(vm, {
		init: init,
		register: register
	});


	function init(){}

	function register(form){
		console.log('register');
		if(form.$valid){
			vm.isLoading = true;

			userService.register(vm.newUser)
				.then(function(res){
					console.log('res', res);
					dialogService.showDialog('Usuario registrado con éxito');
					vm.isLoading = false;
					vm.registerDone = true;
				})
				.catch(function(err){
					vm.isLoading = false;
					console.log('err', err);
					dialogService.showDialog('Hubo un error, revisa tus datos');
				});
		}else{
			dialogService.showDialog('Campos incompletos, revisa tus datos');
		}
	}

}

RegisterCtrl.$inject = [
	'userService',
	'dialogService'
];
