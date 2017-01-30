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

function SearchCtrl($location, $timeout,$routeParams, $q ,productService, dialogService){
  var vm = this;
  vm.loadMore = loadMore;
  vm.searchByFilters = searchByFilters;
  vm.toggleColorFilter = toggleColorFilter;
  vm.scrollTo = scrollTo;

  vm.totalResults = 0;
  vm.isLoading = false;
  vm.filters = [];
  vm.searchValues = [];
  vm.removeSearchValue = removeSearchValue;

  init();

  function init(){
    var keywords = [''];
    if($routeParams.itemcode) {
      vm.isLoading = true;
      vm.search = {};
      vm.search.itemcode = $routeParams.itemcode;
      productService.getById($routeParams.itemcode)
        .then(function(res){
          var foundProduct = res.data.data;
          if(!foundProduct){
            vm.isLoading = false;
            return $q.reject();
          }
          return productService.formatSingleProduct(res.data.data);
        })
        .then(function(fProduct){
            vm.isLoading = false;
            vm.totalResults = 1;
            vm.products = [fProduct];
        })
        .catch(function(err){
          //dialogService.showDialog('Hubo un error: \n ' + err);
          vm.isLoading = false;
        });

    }
    else{
      if($routeParams.term){
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
        vm.isLoading = false;
        return productService.formatProducts(res.data.products);
      })
      .then(function(fProducts){
        vm.products = fProducts;
      })
      .catch(function(err){
        console.log(err);
      });

    }


    productService.getAllFilters().then(function(res){
      vm.filters = res.data;
    });
  }

  function removeSearchValue(removeValue){
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

    var params = {
      ids: searchValuesIds,
      keywords: vm.search.keywords,
      minPrice: vm.minPrice,
      maxPrice: vm.maxPrice,
      page: vm.search.page
    };

    productService.searchByFilters(params).then(function(res){
      vm.totalResults = res.data.total;
      return productService.formatProducts(res.data.products);
    })
    .then(function(fProducts){
      if(options && options.isLoadingMore){
        var productsAux = angular.copy(vm.products);
        vm.products = productsAux.concat(fProducts);
      }else{
        vm.products = fProducts;
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

SearchCtrl.$inject = [
  '$location',
  '$timeout',
  '$routeParams',
  '$q',
  'productService',
  'dialogService'
];
