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
  packageService,
  quotationService,
  api,
  localStorageService,
  productService,
  dialogService
){
  var vm = this;
  angular.extend(vm,{
    init:init,
    addPackageToCart: addPackageToCart
  });

  function init(){
    vm.isLoading = true;
    var activeStore = localStorageService.get('activeStore');
    packageService.getPackagesByStore(activeStore)
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
      })
  }

  function addPackageToCart(packageId){
    vm.isLoading = true;
    var products = [];
    packageService.getProductsByPackage(packageId)
      .then(function(res){
        products     = res.data;
        products     = mapPackageProducts(products);
        var promises = getProductsDeliveriesPromises(products); 
        return $q.all(promises);
      })
      .then(function(deliveries){
        var packageProducts = mapProductsDeliveryDates(products, deliveries, packageId);
        quotationService.addMultipleProducts(packageProducts);
      })
      .catch(function(err){
        console.log(err);
      })
  }

  function getProductsDeliveriesPromises(products){
    var promises    = [];
    var activeStore = localStorageService.get('activeStore');
    for(var i = 0; i<products.length;i++){
      promises.push(productService.delivery(products[i].ItemCode, activeStore));
    }
    return promises;
  }

  function mapPackageProducts(products){
    var packageProducts = products.map(function(product){
      var packageProduct = {
        ItemCode: product.ItemCode,
        id      : product.id,
        quantity: product.packageInfo.quantity,
        name    : product.Name
      };
      return packageProduct;
    });
    return packageProducts;
  }

  function mapProductsDeliveryDates(products, deliveryDates, packageId){
    var availableFlag = true;
    products = products.map(function(product, index){
      var productDeliveryDates = deliveryDates[index] || [];
      if(productDeliveryDates.length == 0){
        availableFlag = false;
      }
      var resultAssigning = assignCloserDeliveryDate(
        product, 
        productDeliveryDates, 
        availableFlag,
        packageId
      );
      product       = resultAssigning.product;
      availableFlag = resultAssigning.availableFlag;
      return product;
    });

    if(!availableFlag){
      showUnavailableMsg(products);
    }
    return products;
  }

  function assignCloserDeliveryDate(product, productDeliveryDates, availableFlag, packageId){
    for(var i = (productDeliveryDates.length-1); i>=0; i--){
      var deliveryDate = productDeliveryDates[i];
      if( product.quantity <=  parseInt(deliveryDate.available) ){
        product.shipDate = deliveryDate.date;
        product.shipCompany = deliveryDate.company;
        product.promotionPackage = packageId;
      }else{
        availableFlag    = false;
        product.hasStock = false;
      }
    }
    return {
      availableFlag: availableFlag,
      product      : product
    };    
  }

  function showUnavailableMsg(products){
    var htmlProducts = products.reduce(function(acum, p){
      acum+="<li>"+p.name+'</li>';
      return acum;
    }, '<ul>');
    htmlProducts += '</ul>';
    dialogService.showDialog(
      'No hay stock disponible de los siguientes productos: '
      + htmlProducts
    );
  }

  vm.init();
}

OffersCtrl.$inject = [
  '$q',
  'packageService',
  'quotationService',
  'api',
  'localStorageService',
  'productService',
  'dialogService'
];
