'use strict';

/**
 * @ngdoc directive
 * @name actualWebApp.directive:offersDirective
 * @description
 * # offersDirective
 */
angular
  .module('actualWebApp')
  .directive('offersDirective', function(
    $q,
    $filter,
    $rootScope,
    $mdDialog,
    packageService,
    quotationService,
    api,
    productService,
    dialogService,
    deliveryService
  ) {
    return {
      templateUrl: 'views/directives/offers.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        scope.addPackageToCart = addPackageToCart;

        var activeQuotation;

        if (!quotationService.getActiveQuotationId()) {
          init();
        } else {
          if ($rootScope.activeQuotation) {
            activeQuotation = $rootScope.activeQuotation;
            init();
          } else {
            $rootScope.$on('activeQuotationAssigned', function() {
              activeQuotation = $rootScope.activeQuotation;
              init();
            });
          }
        }

        function init() {
          scope.isLoading = true;
          loadZipcodeDeliveryByActiveQuotation();

          const packagesOrder = [
            {id: "61fdd7962e9f3c43ccbc9526"},
            {id: "61fdda1f2e9f3c43ccbc953f"},
            {id: "621d50b8c0d1116e5c302a48"},
            {id: "621d4e6fc0d1116e5c302a10"},
            {id: "61fde6892e9f3c43ccbc9586"},
            {id: "61fb5dabff614b161f032a03"},
            {id: "61fc083a2e9f3c43ccbc8eca"},
            {id: "61fac970ff614b161f0326f9"},
            {id: "61fac2d3ff614b161f0326b5"},
            ];

          packageService
            .getPackagesByCurrentStore()
            .then(function(res) {
              scope.packages = res.data.reverse() || [];
              var paquetesx = scope.packages.filter(function(p){
                return p["OnHome"];
              })
              scope.packages = paquetesx;
              console.log(scope.packages)
              scope.packages = scope.packages.map(function(p) {
                p.image = api.cdnUrl + '/uploads/groups/' + p.icon_filename;
                return p;
              });
              //Sort packages array based on the packagesOrder array
              scope.packages = _.sortBy(scope.packages, function(obj) {
                return _.findIndex(packagesOrder, {id: obj.id.toString()});
              }).reverse();
              scope.isLoading = false;
            })
            .catch(function(err) {
              console.log(err);
            });
        }

        function loadZipcodeDeliveryByActiveQuotation() {
          var zipcodeDeliveryId = activeQuotation
            ? activeQuotation.ZipcodeDelivery
            : false;

          console.log('activeQuotation', activeQuotation);
          console.log('zipcodeDeliveryId', zipcodeDeliveryId);
          if (activeQuotation) {
            return loadZipCodeDeliveryById(zipcodeDeliveryId);
          }

          return $q.resolve();
        }

        function loadZipCodeDeliveryById(id) {
          return deliveryService.getZipcodeDeliveryById(id).then(function(res) {
            scope.zipcodeDelivery = res;
            return scope.zipcodeDelivery;
          });
        }

        function addPackageToCart(packageId) {
          if ($rootScope.siteTheme !== 'actual-home') {
            return;
          }

          //$rootScope.scrollTo('main');
          var products = [];

          return deliveryService
            .getZipcodeDelivery('77500')
            .then(function(zipcodeDelivery) {
              if (zipcodeDelivery) {
                scope.isLoading = true;
                scope.zipcodeDelivery = zipcodeDelivery;
              } else {
                if (zipcode) {
                  scope.isLoadingDeliveries = false;
                  dialogService.showDialog(
                    '"Por el momento, su código postal esta fuera de nuestra área de cobertura'
                  );
                }
                return $q.resolve();
              }
              // scope.isLoading = true;
              //$rootScope.scrollTo('main');
              return packageService.getProductsByPackage(packageId);
            })
            .then(function(res) {
              products = res.data;
              products = mapPackageProducts(products);
              var promises = getProductsDeliveriesPromises(products);
              return $q.all(promises);
            })
            .then(function(deliveries) {
              var packageProducts = mapProductsDeliveryDates(
                products,
                deliveries,
                packageId
              );
              if (packageProducts.length > 0) {
                var params = {
                  zipcodeDeliveryId: scope.zipcodeDelivery.id,
                  fromOffers: true
                };
                quotationService.addMultipleProducts(packageProducts, params);
              }
            })
            .catch(function(err) {
              vm.isLoadingDeliveries = false;
              console.log(err);
            });
        }

        function getProductsDeliveriesPromises(products) {
          var promises = [];
          for (var i = 0; i < products.length; i++) {
            var deliveryPromise = productService.delivery(
              products[i].ItemCode,
              scope.zipcodeDelivery.id
            );
            promises.push(deliveryPromise);
          }
          return promises;
        }

        function mapPackageProducts(products) {
          var packageProducts = products.map(function(product) {
            var packageProduct = {
              ItemCode: product.ItemCode,
              id: product.id,
              quantity: product.packageRule.quantity,
              name: product.Name
            };
            return packageProduct;
          });
          return packageProducts;
        }

        function mapProductsDeliveryDates(products, deliveryDates, packageId) {
          products = products.map(function(product, index) {
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
          if (unavailableProducts.length > 0) {
            showUnavailableStockMsg(unavailableProducts);
            return [];
          }
          return products;
        }

        function groupUnavailableProducts(products) {
          var unavailable = products.filter(function(p) {
            return !p.hasStock;
          });
          return unavailable;
        }

        function assignCloserDeliveryDate(
          product,
          productDeliveryDates,
          packageId
        ) {
          product.hasStock = true;
          productDeliveryDates = $filter('orderBy')(
            productDeliveryDates,
            'date'
          );
          for (var i = productDeliveryDates.length - 1; i >= 0; i--) {
            var deliveryDate = productDeliveryDates[i];
            if (product.quantity <= parseInt(deliveryDate.available)) {
              product.shipDate = deliveryDate.date;
              product.originalShipDate = angular.copy(deliveryDate.date);
              (product.productDate = deliveryDate.productDate),
                (product.shipCompany = deliveryDate.company);
              product.shipCompanyFrom = deliveryDate.companyFrom;
              product.promotionPackage = packageId;
              product.PurchaseAfter = deliveryDate.PurchaseAfter;
              product.PurchaseDocument = deliveryDate.PurchaseDocument;
            }
          }
          if (!product.shipDate) {
            product.hasStock = false;
          }
          return product;
        }

        function showUnavailableStockMsg(products) {
          var htmlProducts = products.reduce(function(acum, p) {
            acum += p.name + '(' + p.ItemCode + '), ';
            return acum;
          }, '');
          //htmlProducts += '</ul>';
          dialogService.showDialog(
            'No hay stock disponible de los siguientes productos: ' +
              htmlProducts
          );
        }

        function showZipcodeDialogIfNeeded(ev) {
          ev = null;
          var zipcode;
          var templateUrl = 'views/partials/zipcode-dialog.html';
          var controller = ZipcodeDialogController;

          if (scope.zipcodeDelivery) {
            return $q.resolve(true);
          }

          return $mdDialog
            .show({
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
              locals: {
                params: {
                  inPackagesView: true
                }
              }
            })
            .then(function(_zipcode) {
              zipcode = _zipcode;
              scope.isLoadingDeliveries = true;
              return deliveryService.getZipcodeDelivery(zipcode);
            })
            .then(function(zipcodeDelivery) {
              if (zipcodeDelivery) {
                scope.isLoadingDeliveries = true;
                scope.zipcodeDelivery = zipcodeDelivery;
                return true;
              } else {
                if (zipcode) {
                  scope.isLoadingDeliveries = false;
                  dialogService.showDialog(
                    '"Por el momento, su código postal esta fuera de nuestra área de cobertura'
                  );
                }
                return false;
              }
            })
            .catch(function(err) {
              console.log('err', err);
            });
        }
      }
    };
  });
