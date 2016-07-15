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
      items: 10,
      page: 1
    };
    vm.isLoading = true;
    productService.searchByFilters(vm.search).then(function(res){
      vm.totalResults = res.data.total;
      vm.products = productService.formatProducts(res.data.products);
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

  function searchByFilters(options){
    if(!options || !angular.isDefined(options.isLoadingMore)){
      vm.search.page = 1;
    }
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
    /*
    if (searchValuesIds.length == 0 && !vm.minPrice && !vm.maxPrice) {
      vm.init();
      return;
    }
    */
    var params = {
      ids: searchValuesIds,
      keywords: vm.search.keywords,
      minPrice: vm.minPrice,
      maxPrice: vm.maxPrice,
      page: vm.search.page
    };

    console.log('Pagina: ' + params.page);

    productService.searchByFilters(params).then(function(res){
      vm.totalResults = res.data.total;
      if(options && options.isLoadingMore){
        var productsAux = angular.copy(vm.products);
        var newProducts = productService.formatProducts(res.data.products);
        vm.products = productsAux.concat(newProducts);
      }else{
        vm.products = productService.formatProducts(res.data.products);
        vm.scrollTo('search-page');
      }
      vm.isLoading = false;
    });
  }

  function toggleColorFilter(value, filter){
    value.selected = !value.selected;
    vm.searchByFilters();
  }

  function loadMore(){
    vm.search.page++;
    vm.searchByFilters({isLoadingMore: true});
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
