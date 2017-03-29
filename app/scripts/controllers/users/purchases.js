'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:UsersUserPurchasesCtrl
 * @description
 * # UsersUserPurchasesCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('UsersUserPurchasesCtrl', UsersUserPurchasesCtrl);

function UsersUserPurchasesCtrl(
  $rootScope,
  orderService
){
  var vm = this;
  angular.extend(vm,{
    user: angular.copy($rootScope.user)
  });

  init();

  function init(){
    orderService.getList()
      .then(function(res){
        console.log(res);
        vm.orders = res.data.data;
        vm.ordersTotal = res.data.total;
      })
      .catch(function(err){
        console.log(err);
      });
  }

}