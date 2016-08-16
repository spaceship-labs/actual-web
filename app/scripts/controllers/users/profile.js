'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:UserProfileCtrl
 * @description
 * # UserProfileCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('UserProfileCtrl', UserProfileCtrl);

function UserProfileCtrl($rootScope, $window, $location, $mdDialog, commonService, userService, localStorageService){
  var vm = this;
  vm.user = angular.copy($rootScope.user);
  vm.cashRegister = {};
  vm.update = update;
  vm.onSelectStartDate = onSelectStartDate;
  vm.onSelectEndDate = onSelectEndDate;
  vm.init = init;
  vm.getCashReport = getCashReport;
  vm.groupPayments = groupPayments;
  vm.getTotalGroup = getTotalGroup;
  vm.print = print;

  if(vm.user.userType == 'broker'){
    $location.path('/users/brokerprofile');
  }

  function init(){
    var monthRange = commonService.getMonthDateRange();
    vm.cashRegister.startDate = moment().startOf('day');
    vm.cashRegister.endDate = moment().endOf('day');
    vm.cashRegister.startTime = moment().startOf('day');
    vm.cashRegister.endTime = moment().endOf('day');
  }

  function update(form){
    console.log('update');
    if(form.$valid){
      showConfirm().then(function(ok) {
        if (!ok) {return;}
        vm.isLoading = true;
        userService.update(vm.user).then(function(res){
          vm.isLoading = false;
          commonService.showDialog('Datos actualizados');
          if(res.data.id){
            $rootScope.user = res.data;
            vm.user = $rootScope.user;
            localStorageService.set('user',res.data);
          }
        });
      });
    }
  }

  function onSelectStartDate(pikaday){
    vm.cashRegister.startDate = pikaday._d;
    vm.myPickerEndDate.setMinDate(vm.cashRegister.startDate);
  }

  function onSelectEndDate(pikaday){
    vm.cashRegister.endDate = pikaday._d;
    vm.myPickerStartDate.setMaxDate(vm.cashRegister.endDate);
  }

  function getCashReport(){
    vm.cashRegister.startDate = commonService.combineDateTime(vm.cashRegister.startDate,vm.cashRegister.startTime);
    vm.cashRegister.endDate = commonService.combineDateTime(vm.cashRegister.endDate,vm.cashRegister.endTime,59);
    var params = {
      startDate: vm.cashRegister.startDate,
      endDate: vm.cashRegister.endDate
    };
    console.log(params);
    vm.isLoadingReport = true;
    userService.getCashReport(params).then(function(res){
      console.log(res);
      var payments = res.data;
      vm.paymentsGroups = vm.groupPayments(payments);
      vm.isLoadingReport = false;
    }).catch(function(err){
      console.log(err);
      vm.isLoadingReport = false;
    });
  }

  function groupPayments(payments){
    var groups = [];
    var auxGroups = _.groupBy(payments, function(payment){
      return payment.type + '#' + payment.terminal;
    });
    var groups = _.map(auxGroups, function(group){
        return {
            type: group[0].type,
            name: group[0].name,
            label: group[0].type,
            terminal: group[0].terminal,
            msi: group[0].msi,
            payments: group
        }
    });
    console.log(groups);
    return groups;
  }

  function getTotalGroup(group){
    var total = group.payments.reduce(function(acum, current){
      if(current.currency == 'usd'){
        console.log('dolares');
        acum += (current.ammount * current.exchangeRate);
      }else{
        acum += current.ammount;
      }
      return acum;
    },0);
    return total;
  }

  function showConfirm() {
    var confirm = $mdDialog.confirm()
      .title('¿Quieres cambiar tus datos?')
      .textContent('Este cambio no es reversible')
      .ok('Sí')
      .cancel('No');
    return $mdDialog.show(confirm);
  }

  function print(){
    $window.print();
  }

  vm.init();

}
