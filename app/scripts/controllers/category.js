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
      vm.searchByFilters = searchByFilters;

      var productsAux = res.data.Products;
      var hasLevel2Categories = false;

      var filters = [];
      vm.category.Filters.forEach(function(filter){
        filters.push(filter.id);
      });

      productService.getAllFilters({ids: filters}).then(function(res){
        vm.filters = res.data;
      });


      vm.category.Products = productService.formatProducts(productsAux);
      for(var i=0;i<vm.category.Childs.length;i++){
        if(vm.category.Childs[i].CategoryLevel === 2){
          hasLevel2Categories = true;
          break;
        }
      }
      if(hasLevel2Categories){
        vm.showLevel2 = true;
      }else{
        vm.showLevel3 = true;
      }
    });
  }

  function searchByFilters() {
    var filtervalues = [];
    vm.isLoading = true;
    filtervalues = vm.filters.reduce(function(acum, current) {
      return acum.concat(current.Values);
    }, []);
    filtervalues = filtervalues.reduce(function(acum, current) {
      return current.selected && acum.concat(current.id) || acum;
    }, []);
    if (filtervalues.length === 0) {
      vm.init();
      return;
    }
    var params = {
      category: $routeParams.category,
      filtervalues: filtervalues
    };
    productService.searchCategoryByFilters(params).then(function(res){
      vm.isLoading = false;
      vm.category.Products = productService.formatProducts(res.data.products);
      vm.totalResults = vm.products.length;
      //vm.scrollTo('search-page');
    });
  }

  vm.init();
}
