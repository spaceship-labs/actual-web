function PaymentDialogController(
  $scope, 
  $mdDialog, 
  $filter,
  formatService, 
  commonService, 
  ewalletService,
  dialogService,  
  payment
) {

  'use strict';

  console.log('payment in dialog', payment);
  $scope.payment = payment;
  $scope.payment.cardObject = $scope.payment.cardObject || {};
  $scope.needsVerification = payment.needsVerification;
  $scope.maxAmmount = (payment.maxAmmount >= 0) ? payment.maxAmmount : false;
  $scope.months  = getMonths();
  $scope.years = getYears();

  //ROUNDING
  $scope.payment.ammount = commonService.roundCurrency($scope.payment.ammount);     
  $scope.payment.remaining = commonService.roundCurrency($scope.payment.remaining); 
  if($scope.maxAmmount){
    $scope.maxAmmount = commonService.roundCurrency($scope.maxAmmount);
  }
  if($scope.payment.min){
    $scope.payment.min = commonService.roundCurrency($scope.payment.min);      
  }

  function getYears(){
    var currentDate = moment().add(1,'year').format('YYYY');
    var years = [];
    for(var i=1;i<8;i++){
      years.push( moment().add(i,'year').format('YYYY') );
    }
    return years;
  }

  function getMonths(){
    var months = [];
    for(var i=1;i < 13; i++){
      var month = i;
      if(month < 10){
        month = "0"+month;
      }
      month = month.toString();
      months.push(month);
    }
    console.log('months', months);
    return months;
  }

  $scope.numToLetters = function(num){
    return formatService.numberToLetters(num);
  };

  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };



  $scope.isvalidPayment = function($form){
    console.log('$form',$form);
    return ($form.$valid);
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

  $scope.save = function($form){
    if($form.$valid){
      if($scope.payment.options.length > 0){
        $scope.terminal = getSelectedTerminal($scope.payment.card);
        $scope.payment.terminal = $scope.terminal.value;
      }        
      //alert('cumple');
      console.log('$scope.payment save', $scope.payment);
      $mdDialog.hide($scope.payment);
    }else{
      console.log('No valido');
    }
  };

}