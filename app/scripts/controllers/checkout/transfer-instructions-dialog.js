function TransferInstructionsDialogController($scope, $mdDialog){

  $scope.continue = function(){
    $mdDialog.hide(true);
  };

  $scope.cancel = function(){
    $mdDialog.cancel();
  };

}