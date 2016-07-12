'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:SearchCtrl
 * @description
 * # SearchCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('SearchCtrl', SearchCtrl);

function SearchCtrl($location, $timeout,$routeParams ,productService){
  var vm = this;
  vm.init = init;
  vm.loadMore = loadMore;
  vm.searchByFilters = searchByFilters;
  vm.toggleColorFilter = toggleColorFilter;
  vm.scrollTo = scrollTo;

  vm.totalResults = 0;
  vm.isLoading = false;
  vm.loadMoreCount = 1;
  vm.filters = [];
  vm.searchValues = [];
  vm.removeSearchValue = removeSearchValue;

  vm.init();

  function init(){
    var keywords = [''];
    if($routeParams.term) {
      keywords = $routeParams.term.split(' ');
    }
    vm.search = {
      keywords: keywords,
      items: 10
    };
    vm.isLoading = true;
    productService.advancedSearch(vm.search).then(function(res){
      vm.totalResults = res.data.total;
      vm.products = productService.formatProducts(res.data.data);
      vm.isLoading = false;
    });

    productService.getAllFilters().then(function(res){
      vm.filters = res.data;
    });

  }

  function removeSearchValue(removeValue){
    //var removeIndex = false;
    var removeIndex = vm.searchValues.indexOf(removeValue);
    if(removeIndex > -1){
      vm.searchValues.splice(removeIndex, 1);
    }
    vm.filters.forEach(function(filter){
      filter.Values.forEach(function(val){
        if(val.id == removeValue.id){
          val.selected = false;
        }
      });
    });
    vm.searchByFilters();
  }

  function searchByFilters(){
    vm.isLoading = true;
    vm.searchValues = [];
    var searchValuesIds = [];
    vm.filters.forEach(function(filter){
      filter.Values.forEach(function(val){
        if(val.selected){
          vm.searchValues.push(val);
        }
      });
    });

    vm.searchValues.forEach(function(searchVal){
      searchValuesIds.push(searchVal.id);
    });
    if (searchValuesIds.length == 0 && !vm.minPrice && !vm.maxPrice) {
      vm.init();
      return;
    }
    var params = {
      ids: searchValuesIds,
      keywords: vm.search.keywords,
      minPrice: vm.minPrice,
      maxPrice: vm.maxPrice
    };

    productService.searchByFilters(params).then(function(res){
      vm.isLoading = false;
      vm.products = productService.formatProducts(res.data.products);
      vm.totalResults = res.data.total;
      vm.scrollTo('search-page');
    });
  }

  function toggleColorFilter(value, filter){
    value.selected = !value.selected;
    vm.searchByFilters();
  }

  function loadMore(){
    vm.loadMoreCount++;
    vm.search.page = vm.loadMoreCount;
    vm.isLoading = true;
    //productService.search(vm.search).then(function(res){
    productService.advancedSearch(vm.search).then(function(res){
      vm.totalResults = res.data.total;
      var productsAux = angular.copy(vm.products);
      var newProducts = productService.formatProducts(res.data.data);
      vm.products = productsAux.concat(newProducts);
      vm.isLoading = false;
    });
  }

  function scrollTo(target){
    $timeout(
        function(){
          $('html, body').animate({
            scrollTop: $('#' + target).offset().top - 100
          }, 600);
        },
        300
    );
  }

}
