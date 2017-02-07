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

function SearchCtrl(
  $scope,
  $rootScope,
  $location, 
  $timeout,
  $routeParams, 
  $q ,
  productService, 
  dialogService
){
  var vm = this;
  var mainDataListener = function(){};

  vm.loadMore = loadMore;
  vm.searchByFilters = searchByFilters;
  vm.toggleColorFilter = toggleColorFilter;
  vm.scrollTo = scrollTo;

  vm.totalResults = 0;
  vm.isLoading = false;
  vm.filters = [];
  vm.searchValues = [];
  vm.removeSearchValue = removeSearchValue;

  vm.isLoading = true;
  vm.syncProcessActive = false;

  if($rootScope.activeStore){
    init();
  }else{
    mainDataListener = $rootScope.$on('activeStoreAssigned', function(ev){
      init();
    });
  }  

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
            vm.syncProcessActive = true;
            return $q.reject('Producto no encontrado');
            //return $q.reject('Este producto no existe, verificando en SAP...');
          }
          return productService.formatSingleProduct(res.data.data);
        })
        .then(function(fProduct){
          vm.isLoading = false;
          vm.totalResults = 1;
          vm.products = [fProduct];
        })
        .catch(function(err){
          console.log(err);
          dialogService.showDialog(err);
          vm.isLoading = false;

          /*
          if(vm.syncProcessActive){
            syncProduct(vm.searc.itemcode);
          }*/

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
        mainDataListener();
      })
      .catch(function(err){
        console.log(err);
        mainDataListener();
      });

    }


    productService.getAllFilters().then(function(res){
      vm.filters = res.data;
    });
  }

  function syncProduct(){
    vm.isLoading = true;
    productService.syncProductByItemcode(vm.search.itemcode)
      .then(function(newProduct){
        return productService.formatSingleProduct(newProduct);
      })
      .then(function(fProduct){
        vm.isLoading = false;
        vm.totalResults = 1;
        vm.products = [fProduct];
      })
      .catch(function(err){
        console.log('err', err);
        var error = err.data || err;
        error = error ? error.toString() : '';
        dialogService.showDialog('Hubo un error: ' + error );          
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

  $scope.$on('$destroy', function(){
    mainDataListener();
  });

}

SearchCtrl.$inject = [
  '$scope',
  '$rootScope',
  '$location',
  '$timeout',
  '$routeParams',
  '$q',
  'productService',
  'dialogService'
];
