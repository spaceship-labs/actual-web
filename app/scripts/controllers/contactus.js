'use strict';
angular.module('actualWebApp')
  .controller('ContactusCtrl', ContactusCtrl);

function ContactusCtrl(
	dialogService,
	commonService,
	$rootScope
){
	var vm = this;
	angular.extend(vm, {
		form:{},
		sendContact: sendContact
	});

	function sendContact($form){
		if($form.$valid){
			vm.isLoading = true;
			$rootScope.scrollTo('main');
			commonService.sendContact(vm.form.email,vm.form.name,vm.form)
				.then(function(res){
					if(res.success){
						dialogService.showDialog('Datos enviados');
						vm.sentData = true;
					}else{
						dialogService.showDialog('Hubo un error al enviar tus datos');
					}

					vm.isLoading = false;

				})
				.catch(function(err){
					vm.isLoading = false;
	        var error = err.data || err;
	        error = error ? error.toString() : '';
	        dialogService.showDialog('Hubo un error: ' + (error) );					
				});

		}else{
			dialogService.showDialog('Datos incompletos, revisa los campos');
		}
	}
}

ContactusCtrl.$inject = [
	'dialogService',
	'commonService',
	'$rootScope'
];
