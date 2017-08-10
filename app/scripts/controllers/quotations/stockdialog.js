function StockDialogController($scope, $mdDialog, $location, quotationService, vm, detail){
  
  $scope.cancel = function(){
    $mdDialog.cancel();
  };

  $scope.delete = function(){
    $mdDialog.hide();
    //quotationService.setActiveQuotation(vm.quotation.id);        
    //vm.removeDetailsGroup(detailGroup);
    vm.removeDetail(detail);
  };

  $scope.modify = function(){
    vm.isLoading = true;
    $mdDialog.hide();   
    //vm.removeDetailsGroup(detailGroup)
    vm.removeDetail(detail)
      .then(function(){
        vm.isLoading = true;
        $location.path(detail.Product.url);
      })
      .catch(function(err){
        console.log('err',err);
      });
  };
}