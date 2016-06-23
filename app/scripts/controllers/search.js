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

  vm.search = {
    term: $location.search().term,
    items: 10
  };

  vm.init();

  function init(){
    vm.isLoading = true;
    productService.search(vm.search).then(function(res){
      console.log(res);
      vm.totalResults = res.data.total;
      vm.products = productService.formatProducts(res.data.data);
      vm.isLoading = false;
    });

    productService.getAllFilters().then(function(res){
      console.log(res);
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
    //var values = ['5743763aef7d5e62e508e2f0'];
    vm.filters.forEach(function(filter){
      /*if(filter.selectedValue){
        values.push(filter.selectedValue);
      }*/
      filter.Values.forEach(function(val){
        if(val.selected){
          vm.searchValues.push(val);
        }
      });
    });

    vm.searchValues.forEach(function(searchVal){
      searchValuesIds.push(searchVal.id);
    });

    productService.getProductsByFilters({ids: searchValuesIds}).then(function(res){
      console.log(res);
      vm.isLoading = false;
      vm.products = productService.formatProducts(res.data);
      vm.totalResults = vm.products.length;
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
    productService.search(vm.search).then(function(res){
      console.log(res);
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
