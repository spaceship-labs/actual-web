function TerminalController(
  $scope, 
  $mdDialog, 
  $filter,
  formatService, 
  commonService, 
  ewalletService,
  dialogService,  
  payment
) {

  $scope.payment = payment;
  $scope.needsVerification = payment.needsVerification;
  $scope.maxAmmount = (payment.maxAmmount >= 0) ? payment.maxAmmount : false;

  //ROUNDING
  $scope.payment.ammount = commonService.roundCurrency($scope.payment.ammount);     
  $scope.payment.remaining = commonService.roundCurrency($scope.payment.remaining); 
  if($scope.maxAmmount){
    $scope.maxAmmount = commonService.roundCurrency($scope.maxAmmount);
  }
  if($scope.payment.min){
    $scope.payment.min = commonService.roundCurrency($scope.payment.min);      
  }

  console.log('$scope.payment.min', $scope.payment.min);

  $scope.numToLetters = function(num){
    return formatService.numberToLetters(num);
  };

  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };

  $scope.isMinimumValid = function(){
    $scope.payment.min = $scope.payment.min || 0;   
    if($scope.payment.ammount === $scope.payment.remaining){
      $scope.errMsg = '';
      return true;
    }
    else if( ($scope.payment.remaining - $scope.payment.ammount) >= $scope.payment.min && 
      $scope.payment.ammount >= $scope.payment.min
    ){
      $scope.errMsg = '';
      return true;
    }
    
    if($scope.remaining < $scope.payment.min){
      $scope.errMsg = 'El monto mínimo para esta forma de pago es '+$filter('currency')($scope.payment.min)+' pesos.';
    }
    else if($scope.payment.ammount < $scope.payment.min){
      $scope.errMsg = 'El monto mínimo para esta forma de pago es '+$filter('currency')($scope.payment.min)+' pesos.';
    }
    else{
      $scope.errMsg = 'Favor de aplicar el saldo total';
    }
    return false;
  }; 

  $scope.$watch('payment.ammount', function(newVal, oldVal){
    if(newVal !== oldVal){
      $scope.isMinimumValid();
    }
  });

  function isValidVerificationCode(){
    if($scope.payment.type !== 'deposit'){
      return $scope.payment.verificationCode && $scope.payment.verificationCode !== '';
    }
    return true;
  }

  $scope.isvalidPayment = function(){
    $scope.payment.min = $scope.payment.min || 0;
    if($scope.payment.ammount < $scope.payment.min){
      $scope.minStr = $filter('currency')($scope.payment.min);
      $scope.errMsg = 'La cantidad minima es: ' +  $scope.minStr;
    }else{
      $scope.errMin = false;        
    }

    if( $scope.maxAmmount ){
      return (
        $scope.isMinimumValid() &&
        ($scope.payment.ammount <= $scope.maxAmmount) &&
        $scope.payment.ammount >= $scope.payment.min
      );
    }
    return (
      $scope.payment.ammount && 
      $scope.payment.ammount >= $scope.payment.min        
    );
  };

  $scope.onChangeCard = function(card){
    $scope.terminal = getSelectedTerminal(card);
  };

  function getSelectedTerminal(card){
    var option = _.find($scope.payment.options, function(option){
      return option.card.value === card;
    });
    if(option){
      return option.terminal;
    }
    return false;
  }

  $scope.save = function() {
    if( $scope.isvalidPayment() ){
      if($scope.payment.options.length > 0){
        $scope.terminal = getSelectedTerminal($scope.payment.card);
        $scope.payment.terminal = $scope.terminal.value;
      }        
      //alert('cumple');
      console.log('$scope.payment save', $scope.payment);
      $mdDialog.hide($scope.payment);
    }else{
      console.log('no cumple');
    }
  };
}