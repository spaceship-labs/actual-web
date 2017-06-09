function ZipcodeDialogController($scope, $mdDialog, $rootScope, $location, clientService) {
  var ctrl = this;
  ctrl.init = init;
  ctrl.editAddress = editAddress;
  ctrl.submit = submit;

  function init(){
    if($rootScope.user){
      ctrl.isLoading = true;
      ctrl.user = $rootScope.user;
      loadClientAddresses();
    }
  }

  function addNewAddress(){
    $mdDialog.hide();
    $location.path('/user/deliveries');
  }

  function editAddress(){
    $mdDialog.hide();
    $location.path('/user/deliveries');
  }

  function loadClientAddresses(){
    clientService.getContacts($rootScope.user.CardCode)
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
    console.log('zipcode', zipcode);
    console.log('ctrl.zipcode', ctrl.zipcode);
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