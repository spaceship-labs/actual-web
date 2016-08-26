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
  var vm     = this;
  vm.init    = init;
  vm.filters = [];
  vm.subnavIndex = 0;
  vm.setSubnavIndex = setSubnavIndex;
  vm.getProductsByCategory = getProductsByCategory;
  vm.showLevel2 = false;
  vm.showLevel3 = false;
  vm.page  = 1;
  vm.limit = 10;


  function setSubnavIndex(index){
    vm.subnavIndex = index;
  }

  function init(){
    getCategories();
    getProductsByCategory();
  }

  function getCategories() {
    vm.isLoading = true;
    categoriesService.getCategoryByHandle($routeParams.category).then(function(res){
      vm.category = res.data;
      var hasLevel2Categories = false;
      var filters = vm.category.Filters.map(function(filter){
        return filter.id;
      });
      productService.getAllFilters({ids: filters}).then(function(res){
        vm.filters = res.data;
      });
      hasLevel2Categories = !!vm.category.Childs.find(function(child) {
        return child.CategoryLevel === 2;
      });
      vm.showLevel2 = hasLevel2Categories;
      vm.showLevel3 = !hasLevel2Categories;
      vm.isLoading = false;
    });

  }

  function getProductsByCategory(next){
    vm.isLoadingProducts = true;
    var filtervalues = [];
    if (next) {
      vm.page += 1;
    } else  {
      vm.page = 1;
    }
    filtervalues = vm.filters.reduce(function(acum, current) {
      return acum.concat(current.Values);
    }, []);
    filtervalues = filtervalues.reduce(function(acum, current) {
      return current.selected && acum.concat(current.id) || acum;
    }, []);
    var params = {
      minPrice: vm.minPrice,
      maxPrice: vm.maxPrice,
      category: $routeParams.category,
      filtervalues: filtervalues,
      page: vm.page,
      limit: vm.limit
    };
    productService.searchCategoryByFilters(params).then(function(res){
      var products = res.data.products || [];
      vm.totalProducts = res.data.total;
      return productService.formatProducts(products);
    })
    .then(function(productsFormatted){
      vm.isLoadingProducts = false;
      if (next) {
        vm.products = vm.products.concat(productsFormatted);
      } else {
        vm.products = productsFormatted;
      }
    });
  }

  vm.init();
}

CategoryCtrl.$inject = [
  '$routeParams',
  'categoriesService',
  'productService',
];
