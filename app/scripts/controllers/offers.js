'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:OffersCtrl
 * @description
 * # OffersCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('OffersCtrl', OffersCtrl);

function OffersCtrl(packageService, quotationService, api){
  var vm = this;
  angular.extend(vm,{
    init:init,
    getProductsByPackage: getProductsByPackage
  });

  function init(){
    vm.isLoading = true;
    packageService.getList()
      .then(function(res){
        console.log(res);
        vm.packages = res.data.data || [];
        vm.packages = vm.packages.map(function(p){
          p.image = api.baseUrl + '/uploads/groups/' + p.icon_filename;
          return p;
        });
        vm.isLoading = false;
      })
      .catch(function(err){
        console.log(err);
      })
  }

  function getProductsByPackage(packageId){
    vm.isLoading = true;
    packageService.getProductsByPackage(packageId)
      .then(function(res){
        var products = res.data;
        var packageProducts = products.map(function(p){
          var pp = {
            id: p.id,
            quantity: p.packageInfo.quantity
          };
          return pp;
        });
        console.log(products);
        console.log(packageProducts);
        quotationService.addMultipleProducts(packageProducts);
      })
      .catch(function(err){
        console.log(err);
      })
  }

  vm.init();
}

OffersCtrl.$inject = ['packageService','quotationService','api'];
