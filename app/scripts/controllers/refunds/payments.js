'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:RefundsPaymentsCtrl
 * @description
 * # RefundsPaymentsCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('RefundsPaymentsCtrl', RefundsPaymentsCtrl);

function RefundsPaymentsCtrl(
    $routeParams,
    $rootScope,
    $scope,
    $q,
    $mdMedia,
    $mdDialog,
    $location,
    $filter,
    commonService,
    dialogService,
    formatService,
    orderService,
    pmPeriodService,
    productService,
    quotationService,
    siteService,
    authService,
    clientService,
    paymentService,
    localStorageService,
    $interval
  ){
  var vm = this;

  angular.extend(vm,{
    authorizeOrder: authorizeOrder,
    calculateRemaining: calculateRemaining,
    getExchangeRate:getExchangeRate,
    getPaidPercentage: getPaidPercentage,
    isActiveGroup: isActiveGroup,
    isMinimumPaid: isMinimumPaid,

    customFullscreen: $mdMedia('xs') || $mdMedia('sm'),
    singlePayment: true,
    multiplePayment: false,
    loadingEstimate: 0,
    payments: [],
    paymentMethodsGroups: [],
    roundCurrency: commonService.roundCurrency
  });

  var EWALLET_TYPE = 'ewallet';
  var CASH_USD_TYPE = 'cash-usd';
  var EWALLET_GROUP_INDEX = 0;

  function init(){
    animateProgress();
    vm.isLoading = true;

    orderService.getById($routeParams.id).then(function(res){
        vm.order = res.data;
        vm.order.ammountPaid = vm.order.ammountPaid || 0;
        vm.isLoading = false;
    });
  }


  function updateEwalletBalance(){
    var group = vm.paymentMethodsGroups[EWALLET_GROUP_INDEX];
    var ewalletPaymentMethod = _.findWhere(group.methods, {type:EWALLET_TYPE});
    var ewalletPayments = _.where(vm.order.Payments, {type:EWALLET_TYPE});
    clientService.getEwalletById(vm.order.Client.id)
      .then(function(res){
        var balance = res.data || 0;
        var description = getEwalletDescription(balance);;
        ewalletPaymentMethod.description = description;
        ewalletPayments = ewalletPayments.map(function(payment){
          payment.description = description;
          return payment;
        });
      })
      .catch(function(err){
        console.log(err);
      });
  }

  function getEwalletDescription(balance){
    var description = '';
    var balanceRounded = commonService.roundCurrency( balance, {up:false} );
    var balanceStr = $filter('currency')(balanceRounded);
    description = 'Saldo disponible: ' + balanceStr +' MXN';    
    return description;
  }

  function getExchangeRate(){
    var deferred = $q.defer();
    siteService.findByHandle('actual-group').then(function(res){
      var site = res.data || {};
      deferred.resolve(site.exchangeRate);
    }).catch(function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function isActiveGroup(index){
    var activeKeys = ['paymentGroup1','paymentGroup2','paymentGroup3','paymentGroup4','paymentGroup5'];
    if(vm.validMethods){
      var isGroupUsed = false;
      var currentGroup = getGroupByQuotation(vm.order);
      if( currentGroup < 0 || currentGroup === 1){
        isGroupUsed = true;
      }else if(currentGroup > 0 && currentGroup === index+1){
        isGroupUsed = true;
      }
      return vm.validMethods[activeKeys[index]] && isGroupUsed;
    }else{
      return false;
    }
  }

  function getGroupByQuotation(quotation){
    var group = -1;
    if(quotation.Payments.length > 0){
      group = quotation.paymentGroup;
      var paymentsCount = quotation.Payments.length;
      group = quotation.Payments[paymentsCount - 1].group;
    }
    return group;
  }


  function calculateRemaining(ammount){
    return ammount - vm.order.ammountPaid;
  }

  function authManager(manager){
    vm.isLoading = true;
    authService.authManager(manager)
      .then(function(res){
        var manager = res.data;
        if(!manager.id){
          return $q.reject('Error en la autorización');
        }
        var params = {
          Manager: manager.id,
          minPaidPercentage: 60,
        };
        return quotationService.update(vm.order.id, params);
      })
      .then(function(quotationUpdated){
        vm.isLoading = false;
      })
      .catch(function(err){
        vm.isLoading = false;
        console.log(err);
        dialogService.showDialog('Error en la autorización');
      });
  }

  function authorizeOrder(ev, method, ammount) {
    //if( method && ammount && !isNaN(ammount) ){
    if( getPaidPercentage() >= 60 ){
      var controller  = AuthorizeOrderController;
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && vm.customFullscreen;
      $mdDialog.show({
        controller: ['$scope', '$mdDialog', controller],
        templateUrl: 'views/checkout/authorize-dialog.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        fullscreen: useFullScreen,
      })
      .then(function(manager) {
        authManager(manager);
      }, function() {
        console.log('No autorizado');
      });
    }else{
      commonService.showDialog('La suma pagada debe ser mayor o igual al 60% del total de la orden');
    }
  }



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

  function animateProgress(){
    $interval(function(){
      vm.loadingEstimate += 5;
      if(vm.loadingEstimate >= 100){
        vm.loadingEstimate = 0;
      }
    },1000);
  }

  function getPaidPercentage(){
    var percentage = 0;
    if(vm.order){
      percentage = vm.order.ammountPaid / (vm.order.total / 100);
    }
    return percentage;
  }


  function isMinimumPaid(){
    if(vm.order){
      var minPaidPercentage = vm.order.minPaidPercentage || 100;
      if( getPaidPercentage() >= minPaidPercentage ){
        return true;
      }
    }
    return false;
  }

  init();


}
