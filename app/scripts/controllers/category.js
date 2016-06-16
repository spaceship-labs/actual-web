'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:CategoryCtrl
 * @description
 * # CategoryCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('CategoryCtrl', CategoryCtrl);

function CategoryCtrl($routeParams ,categoriesService, productService){
  var vm = this;
  vm.init = init;

  vm.subnavIndex = 0;
  vm.setSubnavIndex = setSubnavIndex;
  vm.showLevel2 = false;
  vm.showLevel3 = false;


  function setSubnavIndex(index){
    vm.subnavIndex = index;
  }

  function init(){
    categoriesService.getCategoryByHandle($routeParams.category).then(function(res){
      vm.category = res.data;
      var productsAux = res.data.Products;
      var hasLevel2Categories = false;
      vm.category.Products = productService.formatProducts(productsAux);
      for(var i=0;i<vm.category.Childs.length;i++){
        if(vm.category.Childs[i].CategoryLevel == 2){
          hasLevel2Categories = true;
          break;
        }
      }
      if(hasLevel2Categories){
        vm.showLevel2 = true;
      }else{
        vm.showLevel3 = true;
      }
      console.log(vm.products);
    });
  }

  vm.init = init();

}
