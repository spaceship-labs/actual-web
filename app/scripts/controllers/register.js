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
	clientService,
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

			clientService.create(vm.newClient)
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
	'clientService',
	'dialogService'
];
