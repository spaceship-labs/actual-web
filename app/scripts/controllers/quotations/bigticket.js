function BigTicketController($scope, $mdDialog, options){
  $scope.bigticketPercentage = options.bigticketPercentage;
  $scope.bigticketMaxPercentage = options.bigticketMaxPercentage || 0;
  $scope.init = function(){
    $scope.bigticketPercentage = options.bigticketPercentage;
  };
  $scope.getPercentages = function(){
    var percentages = [0];
    for(var i=1;i<=$scope.bigticketMaxPercentage;i++){
      percentages.push(i);
    }
    return percentages;
  };

  $scope.percentages = [
    {label:'1%',value:1},
    {label:'2%',value:2},
    {label:'3%',value:3},
    {label:'4%',value:4},
    {label:'5%',value:5},
  ];


  $scope.cancel = function(){
    $mdDialog.cancel();
  };

  $scope.applyPercentage = function(){
    $mdDialog.hide($scope.bigticketPercentage);
  };

  $scope.init();    
}