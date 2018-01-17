'use strict';

/**
 * @ngdoc function
 * @name actualWebApp.controller:SearchCtrl
 * @description
 * # SearchCtrl
 * Controller of the actualWebApp
 */
angular.module('actualWebApp')
  .controller('SearchCtrl', SearchCtrl);

function SearchCtrl(
  $scope,
  $rootScope,
  $location, 
  $timeout,
  $routeParams, 
  $q ,
  $mdSidenav,
  productService, 
  dialogService,
  productSearchService,
  metaTagsService,
  SITE
){
  var vm = this;

  angular.extend(vm, {
    totalResults:0,
    isLoading: true,
    filters: [],
    searchValues: [],
    syncProcessActive: false,
    enableSortOptions: true,    
    discountFilters: productSearchService.DISCOUNTS_SEARCH_OPTIONS,
    stockFilters: productSearchService.STOCK_SEARCH_OPTIONS,
    societyFilters: productSearchService.SOCIETY_OPTIONS,
    sortOptions: productSearchService.SORT_OPTIONS,
    loadMore: loadMore,
    getFilterById: getFilterById,
    searchByFilters: searchByFilters,
    toggleColorFilter: toggleColorFilter,
    scrollTo: scrollTo,
    toggleSearchSidenav: toggleSearchSidenav,
    removeSearchValue:removeSearchValue,
    removeBrandSearchValue: removeBrandSearchValue,
    removeSelectedDiscountFilter: removeSelectedDiscountFilter,
    removeSelectedStockFilter: removeSelectedStockFilter,
    removeSelectedSocietyFilter: removeSelectedSocietyFilter,
    removeMinPrice: removeMinPrice,
    removeMaxPrice: removeMaxPrice,
    setActiveSortOption: setActiveSortOption
  });

  var mainDataListener = function(){};
  var activeQuotationListener = function(){};

  console.log('starting search', new Date());

  if(SITE.name === 'actual-kids'){

    if($rootScope.activeQuotation || $rootScope.isActiveQuotationLoaded){
      console.log('init on actual kids preloaded', $rootScope.activeQuotation);
      init();
    }
    else{
      activeQuotationListener = $rootScope.$on('activeQuotationAssigned', function(e){
        console.log('init on actual kids event', $rootScope.activeQuotation);
        init();
      });
    }


  }else{
    if($rootScope.activeStore){
      init();
    }else{
      mainDataListener = $rootScope.$on('activeStoreAssigned', function(ev){
        init();
      });
    }
  }    



  function init(){
    console.log('init search', new Date());

    var metaTags = {
      title: $rootScope.siteConstants.publicName + ' | ' + 'Búsqueda'
    };
    metaTagsService.setMetaTags(metaTags);


    var keywords = [''];
    var activeSortOptionKey = 'salesCount';
    vm.activeSortOption = _.findWhere(vm.sortOptions,{key: activeSortOptionKey});

    if($routeParams.itemcode) {
      vm.isLoading = true;
      vm.search = {};
      vm.search.itemcode = $routeParams.itemcode;
      vm.search.sortOption = vm.activeSortOption;

      if(SITE.name === 'actual-kids' && $rootScope.activeQuotation){
        vm.search.zipcodeDeliveryId = $rootScope.activeQuotation.ZipcodeDelivery;
      }

      syncProduct(vm.search.itemcode);
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
      vm.search.sortOption = vm.activeSortOption;

      if(SITE.name === 'actual-kids' && $rootScope.activeQuotation){
        vm.search.zipcodeDeliveryId = $rootScope.activeQuotation.ZipcodeDelivery;
      }

      vm.isLoading = true;
      doInitialSearch();

    }

    loadFilters();
    loadCustomBrands();

  }

  function doInitialSearch(){
    productService.searchByFilters(vm.search).then(function(res){
      vm.totalResults = res.data.total;
      vm.isLoading = false;
      return productService.formatProducts(res.data.products);
    })
    .then(function(fProducts){
      vm.products = fProducts;
      mainDataListener();
      activeQuotationListener();
      window.prerenderReady = true;      
    })
    .catch(function(err){
      console.log(err);
      var error = err.data || err;
      error = error ? error.toString() : '';
      dialogService.showDialog('Hubo un error: ' + error );           
      mainDataListener();
      activeQuotationListener();
    });    
  }

  function syncProduct(itemcode){
    productService.syncProductByItemcode(itemcode)
      .then(function(res){
        var foundProduct = res.data;
        if(!foundProduct){
          vm.isLoading = false;
          return $q.reject('Producto no encontrado');
        }
        return productService.formatSingleProduct(foundProduct);
      })
      .then(function(formattedProduct){
        vm.isLoading = false;
        dialogService.showDialog('Producto sincronizado');
        vm.totalResults = 1;
        vm.products = [formattedProduct];
        mainDataListener();
        activeQuotationListener();
      })
      .catch(function(err){
        console.log(err);
        var error = err.data || err;
        error = error ? error.toString() : '';
        dialogService.showDialog('Hubo un error: ' + error );           
        vm.isLoading = false;
        mainDataListener();
        activeQuotationListener();
      });    
  }

  function loadFilters(){
    productService.getAllFilters()
      .then(function(res){
        vm.filters = res.data;
        vm.filters = vm.filters.filter(function(filter){
          return filter.Handle !== 'marcas';
        });
        vm.filters = vm.filters.map(function(filter){
          filter.orderBy = filter.customOrder ? 'createdAt' : 'Name';
          return filter;
        });

        vm.filters = sortFiltersByList(vm.filters);
        onCloseSidenav();
      })
      .catch(function(err){
        console.log('err', err);
      });    
  }

  function onCloseSidenav(){
    $mdSidenav('searchFilters').onClose(function () {
      for(var i = 0; i < vm.filters.length; i++){
        vm.filters[i].active = false;
      }
      vm.isBrandFilterActive = false;
      vm.isDiscountFilterActive = false;
      vm.isStockFilterActive = false;
    });
  }

  function sortFiltersByList(filters){
    var sortList = ['estilo','material','color','forma'];
    var sorted =  filters.sort(function(a,b){
      return sortList.indexOf(b.Handle) - sortList.indexOf(a.Handle);
    });
    return sorted;
  }

  function loadCustomBrands(){
    productService.getCustomBrands()
      .then(function(res){
        vm.customBrands = res.data;
        console.log('customBrands', vm.customBrands);
      })
      .catch(function(err){
        console.log('err', err);
      });    
  }

  function toggleSearchSidenav(filterHandleToOpen){
    $mdSidenav('searchFilters').toggle();
    
    if(filterHandleToOpen){
      var filterIndexToOpen = _.findIndex(vm.filters, function(filter){
        return filter.Handle === filterHandleToOpen;
      });
      if(filterIndexToOpen >= 0){
        vm.filters[filterIndexToOpen].active = true;
      }
      else{

        switch(filterHandleToOpen){
          case 'brand':
            vm.isBrandFilterActive = true;
            break;
          case 'discount':
            vm.isDiscountFilterActive = true;
            break;
          case 'stock':
            vm.isStockFilterActive = true;
            break;
        }
      }
    }
  }

  function removeSearchValue(value){
    var removeIndex = vm.searchValues.indexOf(value);
    if(removeIndex > -1){
      vm.searchValues.splice(removeIndex, 1);
    }
    vm.filters.forEach(function(filter){
      filter.Values.forEach(function(val){
        if(val.id === value.id){
          val.selected = false;
        }
      });
    });

    searchByFilters();
  }

  function removeBrandSearchValue(value){
    var removeIndex = vm.brandSearchValues.indexOf(value);
    if(removeIndex > -1){
      vm.brandSearchValues.splice(removeIndex, 1);
    }
    vm.customBrands.forEach(function(brand){
      if(brand.id === value.id){
        brand.selected = false;
      }
    });

    searchByFilters();
  }

  function removeSelectedDiscountFilter(discount){
    var removeIndex = vm.discountFiltersSelected.indexOf(discount);
    if(removeIndex > -1){
      vm.discountFiltersSelected.splice(removeIndex, 1);
    }
    vm.discountFilters.forEach(function(discountFilter){
      if(discountFilter.value === discount.value){
        discountFilter.selected = false;
      }
    });

    searchByFilters();

  }

  function removeSelectedSocietyFilter(society){
    var removeIndex = vm.societyFiltersSelected.indexOf(society);
    if(removeIndex > -1){
      vm.societyFiltersSelected.splice(removeIndex, 1);
    }
    vm.societyFilters.forEach(function(societyFilter){
      if(societyFilter.code === society.code){
        societyFilter.selected = false;
      }
    });

    searchByFilters();

  }  

  function removeSelectedStockFilter(stockRangeObject){
    var removeIndex = vm.stockFiltersSelected.indexOf(stockRangeObject);
    if(removeIndex > -1){
      vm.stockFiltersSelected.splice(removeIndex, 1);
    }
    vm.stockFilters.forEach(function(stockFilters){
      if(stockFilters.id === stockRangeObject.id){
        stockFilters.selected = false;
      }
    });

    searchByFilters();

  }  

  function removeMinPrice(){
    delete vm.minPrice;
    searchByFilters();
  }

  function removeMaxPrice(){
    delete vm.maxPrice;
    searchByFilters();
  }


  function searchByFilters(options){
    if(!options || !angular.isDefined(options.isLoadingMore)){
      vm.search.page = 1;
    }
    vm.isLoading = true;
    
    //SEARCH VALUES
    vm.searchValues = productSearchService.getSearchValuesByFilters(vm.filters);
    var searchValuesIds = productSearchService.getSearchValuesIds(vm.searchValues);

    //BRANDS
    vm.brandSearchValues = vm.customBrands.filter(function(brand){
      return brand.selected;
    });
    var brandSearchValuesIds = vm.brandSearchValues.map(function(brand){
      return brand.id;
    });

    //DISCOUNTS
    vm.discountFiltersSelected = vm.discountFilters.filter(function(discount){
      return discount.selected;
    });
    var discountFiltersValues = vm.discountFiltersSelected.map(function(discount){
      return discount.value;
    });

    //STOCK
    vm.stockFiltersSelected = vm.stockFilters.filter(function(stock){
      return stock.selected;
    });
    var stockFiltersValues = vm.stockFiltersSelected.map(function(stock){
      return stock.value;
    });

    //SOCIETIES
    vm.societyFiltersSelected = vm.societyFilters.filter(function(society){
      return society.selected;
    });
    var societyFiltersValues = vm.societyFiltersSelected.map(function(society){
      return society.code;
    });


    var params = {
      ids: searchValuesIds,
      brandsIds: brandSearchValuesIds,
      discounts: discountFiltersValues,
      societyCodes: societyFiltersValues,
      stockRanges: stockFiltersValues,
      keywords: vm.search.keywords,
      minPrice: vm.minPrice,
      maxPrice: vm.maxPrice,
      page: vm.search.page,
      sortOption: vm.activeSortOption,
      zipcodeDeliveryId: vm.search.zipcodeDeliveryId
    };

    if(vm.activeSortOption && vm.activeSortOption.key === 'slowMovement'){
      params.slowMovement = true;      
    }
    else if(vm.activeSortOption && vm.activeSortOption.key === 'spotlight'){
      params.spotlight = true;      
    }

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

  function setActiveSortOption(sortOption){

    if(vm.activeSortOption.key  === sortOption.key){
      sortOption.direction = sortOption.direction === 'ASC' ? 'DESC' : 'ASC';
    }
    else if(sortOption.key === 'salesCount' || sortOption.key === 'slowMovement'){
      sortOption.direction = 'DESC';
    }
    else{
      sortOption.direction = 'ASC';
    }

    vm.activeSortOption = sortOption;
    searchByFilters();
  }

  function getFilterById(filterId){
    return _.findWhere(vm.filters, {id: filterId});
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
    activeQuotationListener();
  });

}

SearchCtrl.$inject = [
  '$scope',
  '$rootScope',
  '$location',
  '$timeout',
  '$routeParams',
  '$q',
  '$mdSidenav',
  'productService',
  'dialogService',
  'productSearchService',
  'metaTagsService',
  'SITE'
];
