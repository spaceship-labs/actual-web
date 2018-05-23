'use strict';

angular.module('actualWebApp')
  .controller('CompleteRegisterCtrl', CompleteRegisterCtrl);

function CompleteRegisterCtrl(
  $rootScope,
  $location,
  $q,
  api, 
  dialogService,
  authService,
  userService
){
  var vm = this;

	var urlParams = $location.search();
	var email = urlParams.email;
	var token = urlParams.token;
	if(!token || !email){
		$location.path('/');
	}

  angular.extend(vm, {
    resetPassword: resetPassword,
    email: email
  });

  if($rootScope.user){
  	//$location.path('/');
  }

  function resetPassword(form){
		if(form.$valid && vm.password && vm._password && (vm.password === vm._password)){
			vm.isLoading = true;

			var params = {
        password: vm.password,
        confirm_pass: vm._password,
        email: email,
        token: token
			};

      var handleSignInError = function(err) {
        console.log('err', err);
        dialogService.showDialog('Error al iniciar sesión');
      };

      var formData = {
        email: email,
        password: params.password
      }

	  	userService.resetPassword(params)
	  		.then(function(res){
          console.log('res reset', res);
          if(!res.data.success){
            $q.reject();
          }

          return authService.signIn(
            formData,
            $rootScope.successAuth,
            handleSignInError
          );
        })
        .then(function(){ 
	  			vm.isLoading = false;
	  		})
	  		.catch(function(err){
          vm.isLoading = false;
          vm.message = 'Hubo un error, intenta de nuevo';
          dialogService.showDialog(vm.message);	  			
	  		});
		}else{
			dialogService.showDialog('Revisa tus datos e intenta de nuevo');
		}
  }

}

CompleteRegisterCtrl.$inject = [
  '$rootScope',
  '$location',
  '$q',
  'api',
  'dialogService',
  'authService',
  'userService'
];
