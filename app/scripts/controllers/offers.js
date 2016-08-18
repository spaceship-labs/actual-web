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
    var companyActive = localStorageService.get('companyActive');
    packageService.getPackagesByStore(companyActive)
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
    var companyActive = localStorageService.get('companyActive');
    var products = [];
    var packageProducts = [];
    packageService.getProductsByPackage(packageId)
      .then(function(res){
        var promises = [];
        products = res.data;
        packageProducts = products.map(function(p){
          promises.push(productService.delivery(p.ItemCode, companyActive));
          var pp = {
            id: p.id,
            quantity: p.packageInfo.quantity,
            name: p.Name
          };
          return pp;
        });

        return $q.all(promises);
        //quotationService.addMultipleProducts(packageProducts);
      })
      .then(function(deliveries){
        var stockAvailable = true;
        var auxProducts = [];
        packageProducts = packageProducts.map(function(pp, index){
          var deliveryOptions = deliveries[index] || [];
          var availableFlag = false;
          if(deliveryOptions.length == 0){
            stockAvailable = false;
            availableFlag = false;
          }
          for(var i = (deliveryOptions.length-1); i>=0; i--){
            var d = deliveryOptions[i];
            if( pp.quantity <=  parseInt(d.available) ){
              pp.shipDate = d.date;
              pp.shipCompany = d.company;
              pp.promotionPackage = packageId;
              availableFlag = true;
            }else{
              stockAvailable = false;
              availableFlag = false;
            }
          }
          auxProducts.push(pp);
          return pp;
        });
        if(!stockAvailable){
          var htmlProducts = auxProducts.reduce(function(acum, curr){
            acum+="<li>"+curr.name+'</li>';
            return acum;
          }, '<ul>');
          htmlProducts += '</ul>';
          dialogService.showDialog(
            'No hay stock disponible de los siguientes productos: '
            + htmlProducts
          );
          vm.isLoading = false;
          return;
        }
        quotationService.addMultipleProducts(packageProducts);
      })
      .catch(function(err){
        console.log(err);
      })
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
