function AuthorizeOrderController($scope, $mdDialog){
  $scope.manager = {};
  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.authorize = function(form) {
    if(form.$valid){
      $mdDialog.hide($scope.manager);
    }
  };
}