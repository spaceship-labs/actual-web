function PaymentDialogController(
  $scope,
  $mdDialog,
  $filter,
  $timeout,
  formatService,
  commonService,
  ewalletService,
  dialogService,
  payment
) {

  'use strict';

  console.log('payment in dialog', payment);

  $scope.payment = payment;
  $scope.payment.cardCountry = $scope.payment.cardCountry || 'Mexico';
  $scope.payment.cardObject = $scope.payment.cardObject || {};
  $scope.needsVerification = payment.needsVerification;
  $scope.maxAmmount = (payment.maxAmmount >= 0) ? payment.maxAmmount : false;
  $scope.countries = commonService.getCountries();
  $scope.states = commonService.getStates();
  $scope.months  = getMonths();
  $scope.years = getYears();

  if($scope.payment.options){
    $scope.paymentOptionsOriginal = _.clone($scope.payment.options);
  }

  //ROUNDING
  $scope.payment.ammount = commonService.roundCurrency($scope.payment.ammount);
  $scope.payment.remaining = commonService.roundCurrency($scope.payment.remaining);
  if($scope.maxAmmount){
    $scope.maxAmmount = commonService.roundCurrency($scope.maxAmmount);
  }
  if($scope.payment.min){
    $scope.payment.min = commonService.roundCurrency($scope.payment.min);
  }

  init();

  function init(){
    if($scope.payment.type !== 'transfer'){
      setPaymentOptionsBasedOnCardType($scope.payment.cardType);
    }
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


  $scope.$watch('payment.cardType',function(newVal, oldVal){
    //console.log('new val', newVal);
    if(newVal !== oldVal && oldVal){

      console.log('oldVal', oldVal);
      console.log('newVal', newVal);

      setPaymentOptionsBasedOnCardType(newVal);

    }
  });
  
  function setPaymentOptionsBasedOnCardType(cardType){
    if(cardType === 'american-express'){
      $scope.changingOptions = true;
      $scope.payment.options = [];
      $scope.payment.options = $scope.paymentOptionsOriginal.filter(function(option){
        return option.card.value === 'american-express';
      });
      $timeout(function(){
        $scope.changingOptions = false;
      }, 200);
    }else{
      $scope.changingOptions = true;
      $scope.payment.options = [];
      $scope.payment.options = $scope.paymentOptionsOriginal.filter(function(option){
        return option.card.value !== 'american-express';
      }); 
      $timeout(function(){
        $scope.changingOptions = false;
      }, 200);

    }    
  }


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
    if(!$scope.acceptTerms){
      alert('Acepta los terminos y condiciones');
      return;
    }

    if($form.$valid){

      if($scope.payment.options.length > 0 && $scope.payment.type !== 'transfer'){
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
