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

function OffersCtrl(
  $q,
  $filter,
  $scope,
  $rootScope,
  $mdDialog,
  packageService,
  quotationService,
  api,
  localStorageService,
  productService,
  dialogService,
  deliveryService
){
  var mainDataListener = function(){};
  var vm = this;
  angular.extend(vm,{
    init:init,
    addPackageToCart: addPackageToCart,
  });

  if($rootScope.activeQuotation){
    init();    
  }else{
    mainDataListener = $rootScope.$on('mainDataLoaded', function(e){
      init();
    });
  }

  function loadZipcodeDeliveryByActiveQuotation(){
    var zipcodeDeliveryId =  $rootScope.activeQuotation ? $rootScope.activeQuotation.ZipcodeDelivery : false;
    if($rootScope.activeQuotation){
      return loadZipCodeDeliveryById(zipcodeDeliveryId);
    }

    return $q.resolve();    
  }

  function init(){
    vm.isLoading = true;
    loadZipcodeDeliveryByActiveQuotation();

    packageService.getPackagesByCurrentStore()
      .then(function(res){
        vm.packages = res.data || [];
        vm.packages = vm.packages.map(function(p){
          p.image = api.baseUrl + '/uploads/groups/' + p.icon_filename;
          return p;
        });
        vm.isLoading = false;
      })
      .catch(function(err){
        console.log(err);
      });

    //Unsuscribing  mainDataListener
    mainDataListener();
  }

  function loadZipCodeDeliveryById(id){
    return deliveryService.getZipcodeDeliveryById(id)
      .then(function(res){
        vm.zipcodeDelivery = res;
        return true;
      });
  }  

  function addPackageToCart(packageId){
    $rootScope.scrollTo('main');
    var products = [];

    showZipcodeDialogIfNeeded(null)
      .then(function(hasValidZipcode){
        if(!hasValidZipcode){
          return $q.reject('Código postal no valido');
        }

        vm.isLoading = true;
        $rootScope.scrollTo('main');
        return packageService.getProductsByPackage(packageId);
      })
      .then(function(res){
        products     = res.data;
        products     = mapPackageProducts(products);
        var promises = getProductsDeliveriesPromises(products); 
        return $q.all(promises);
      })
      .then(function(deliveries){
        var packageProducts = mapProductsDeliveryDates(products, deliveries, packageId);
        if(packageProducts.length > 0){
          
          var params = {
            zipcodeDeliveryId: vm.zipcodeDelivery.id
          };
          quotationService.addMultipleProducts(packageProducts, params);
        }
      })
      .catch(function(err){
        console.log(err);
      });
  }

  function getProductsDeliveriesPromises(products){
    var promises    = [];
    for(var i = 0; i<products.length;i++){
      var deliveryPromise = productService.delivery(products[i].ItemCode,vm.zipcodeDelivery.id);
      promises.push(deliveryPromise);
    }
    return promises;
  }

  function mapPackageProducts(products){
    var packageProducts = products.map(function(product){
      var packageProduct = {
        ItemCode: product.ItemCode,
        id      : product.id,
        quantity: product.packageRule.quantity,
        name    : product.Name
      };
      return packageProduct;
    });
    return packageProducts;
  }

  function mapProductsDeliveryDates(products, deliveryDates, packageId){
    products = products.map(function(product, index){
      var productDeliveryDates = deliveryDates[index] || [];
      console.log('product: ' + product.ItemCode);
      console.log('deliveryDates', productDeliveryDates);
      product = assignCloserDeliveryDate(
        product, 
        productDeliveryDates, 
        packageId
      );
      return product;
    });
    var unavailableProducts = groupUnavailableProducts(products);
    if(unavailableProducts.length > 0){
      showUnavailableStockMsg(unavailableProducts);
      return [];
    }
    return products;
  }

  function groupUnavailableProducts(products){
    var unavailable = products.filter(function(p){
      return !p.hasStock;
    });
    return unavailable;
  }

  function assignCloserDeliveryDate(product, productDeliveryDates, packageId){
    product.hasStock = true;
    productDeliveryDates = $filter('orderBy')(productDeliveryDates, 'date');
    for(var i = (productDeliveryDates.length-1); i>=0; i--){
      var deliveryDate = productDeliveryDates[i];
      if( product.quantity <=  parseInt(deliveryDate.available) ){
        product.shipDate         = deliveryDate.date;
        product.originalShipDate = angular.copy(deliveryDate.date);
        product.productDate      = deliveryDate.productDate,
        product.shipCompany      = deliveryDate.company;
        product.shipCompanyFrom  = deliveryDate.companyFrom;
        product.promotionPackage = packageId;
        product.PurchaseAfter    = deliveryDate.PurchaseAfter;
        product.PurchaseDocument = deliveryDate.PurchaseDocument;
        
      }
    }
    if(!product.shipDate){
      product.hasStock = false;
    }
    return product;    
  }

  function showUnavailableStockMsg(products){
    var htmlProducts = products.reduce(function(acum, p){
      //console.log('p', p);
      //acum+="<li>"+p.name+'</li>';
      acum += p.name + '('+ p.ItemCode +'), ';
      return acum;
    }, '');
    //htmlProducts += '</ul>';
    dialogService.showDialog(
      'No hay stock disponible de los siguientes productos: '+ htmlProducts
    );
  }

  function showZipcodeDialogIfNeeded(ev) {
    ev = null;
    var zipcode;
    var templateUrl = 'views/partials/zipcode-dialog.html';
    var controller  = ZipcodeDialogController;
    
    if(vm.zipcodeDelivery){
      return $q.resolve(true);
    }

    return $mdDialog.show({
      controller: [
        '$scope',
        '$mdDialog',
        '$rootScope',
        '$location',
        'userService',
        'params',
        controller
      ],
      controllerAs: 'ctrl',
      templateUrl: templateUrl,
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      fullscreen: false,
      locals:{
        params: {
          inPackagesView: true
        }
      }
    })
    .then(function(_zipcode) {
      zipcode = _zipcode;
      vm.isLoadingDeliveries = true;
      return deliveryService.getZipcodeDelivery(zipcode);
    })
    .then(function(zipcodeDelivery){
      console.log('zipcodedelivery', zipcodeDelivery);
      if(zipcodeDelivery){
        vm.isLoadingDeliveries = true;
        vm.zipcodeDelivery = zipcodeDelivery;
        return true;
      }else{
        if(zipcode){
          vm.isLoadingDeliveries = false;
          dialogService.showDialog('"Por el momento, su código postal esta fuera de nuestra área de cobertura');
        }
        return false;
      }
    })
    .catch(function(err){
      console.log('err', err);
    });
  }

  $scope.$on('$destroy', function(){
    //unsuscribing listeners
    mainDataListener();
  });

}

OffersCtrl.$inject = [
  '$q',
  '$filter',
  '$scope',
  '$rootScope',
  '$mdDialog',
  'packageService',
  'quotationService',
  'api',
  'localStorageService',
  'productService',
  'dialogService',
  'deliveryService'
];
