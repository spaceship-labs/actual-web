function ZipcodeDialogController($scope, $mdDialog, $rootScope, $location, userService, params) {
  'use strict';

  var ctrl = this;
  console.log('params', params);
  params = params || {};

  ctrl.init = init;
  ctrl.editAddress = editAddress;
  ctrl.submit = submit;
  ctrl.toggleLoginModal = toggleLoginModal;
  ctrl.addNewAddress = addNewAddress;
  ctrl.params = params;

  function init(){
    /*
    if($rootScope.user){
      ctrl.isLoading = true;
      ctrl.user = $rootScope.user;
      loadClientAddresses();
    }
    */
  }

  function toggleLoginModal(){
    console.log('toggleLoginModal');
    $rootScope.toggleLoginModal();
    $mdDialog.cancel();
  }

  function addNewAddress(){
    console.log('addNewAddress');
    $mdDialog.hide();
    var currentPath = $location.path();
    $location.path('/user/deliveries')
      .search({
        returnTo: currentPath
      });
  }

  function editAddress(){
    $mdDialog.hide();
    var currentPath = $location.path();
    $location.path('/user/deliveries')
      .search({
        returnTo: currentPath
      });
  }

  function loadClientAddresses(){
    userService.getUserContacts()
      .then(function(res){
        ctrl.addresses = res;
        if(ctrl.addresses.length > 0){
          console.log('ctrl.addresses', ctrl.addresses)
          ctrl.zipcode = ctrl.addresses[0].U_CP;
        }
        ctrl.isLoading = false;
      })
      .catch(function(err){
        console.log('err', err);
        ctrl.isLoading = false;
      });
  }

   function submit($form, zipcode){
    var _isValidZipcode = isValidZipcode(ctrl.zipcode);

    if($form.$valid &&  _isValidZipcode){
      $mdDialog.hide(ctrl.zipcode);//
    }
    else if(!_isValidZipcode){
      ctrl.errMessage = 'El código postal no es valido';
    }
    else{
      ctrl.errMessage = "Ingresa tus datos";
    }
  }

  function isValidZipcode(zipcode){
    return zipcode.length === 5;
  }

  init();
}
