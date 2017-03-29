'use strict';

/**
 * @ngdoc overview
 * @name dashexampleApp
 * @description
 * # dashexampleApp
 *
 * Main module of the application.
 */
angular
  .module('dashexampleApp', [
    'ngAnimate',
    'ngStorage',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ngMaterial',
    'slick',
    'LocalStorageModule',
    'angular-jwt',
    'datatables',
    'chart.js',
    'ezplus',
    'pikaday',
    'ui.timepicker',
    'ngFileUpload',
    'sly',
    'infinite-scroll',
    'ngPhotoswipe',
    'ui.utils.masks',
    'leaflet-directive',
    'localytics.directives',
    'ng-currency',
    'envconfig',
    'siteconfig',
  ])

  .config(function (
    $routeProvider,
    $httpProvider,
    $locationProvider,
    $mdThemingProvider,
    localStorageServiceProvider,
    ENV
  ) {


    $mdThemingProvider.theme('default')
      .accentPalette('red', {
        'default': '700' // use shade 200 for default, and keep all other shades the same
      });


    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');

    $routeProvider
      .when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl',
        controllerAs: 'vm'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'vm'
      })
      .when('/category/:category', {
        templateUrl: 'views/category.html',
        controller: 'CategoryCtrl',
        controllerAs: 'vm'
      })
      .when('/product/:id', {
        templateUrl: 'views/product.html',
        controller: 'ProductCtrl',
        controllerAs: 'vm'
      })
      .when('/search', {
        templateUrl: 'views/search.html',
        controller: 'SearchCtrl',
        controllerAs: 'vm'
      })
      .when('/addquotation', {
        templateUrl: 'views/addquotation.html',
        controller: 'AddquotationCtrl',
        controllerAs: 'vm',
      })
      .when('/user/profile', {
        templateUrl: 'views/users/profile.html',
        controller: 'UserProfileCtrl',
        controllerAs: 'vm',
        resolve: {
          isMiActual: function($rootScope){
            $rootScope.isMiActual = true;
            return true;
          }
        }
      })
      .when('/quotations/edit/:id', {
        templateUrl: 'views/quotations/edit.html',
        controller: 'QuotationsEditCtrl',
        controllerAs: 'vm',
        resolve: {
          isMiActual: function($rootScope){
            $rootScope.isMiActual = true;
            return true;
          }
        }
      })
      .when('/checkout/client/:id', {
        templateUrl: 'views/checkout/client.html',
        controller: 'CheckoutClientCtrl',
        controllerAs: 'vm',
        resolve: {
          isMiActual: function($rootScope, authService){
            authService.dennyAccessBroker();
            authService.dennyAccessStoreManager();
            $rootScope.isMiActual = true;
            return true;
          }
        }

      })
      .when('/checkout/paymentmethod/:id', {
        templateUrl: 'views/checkout/payments.html',
        controller: 'CheckoutPaymentsCtrl',
        controllerAs: 'vm',
        resolve: {
          isMiActual: function($rootScope, authService){
            authService.dennyAccessBroker();
            authService.dennyAccessStoreManager();
            $rootScope.isMiActual = true;
            return true;
          }
        }
      })
      .when('/checkout/order/:id', {
        templateUrl: 'views/checkout/order.html',
        controller: 'CheckoutOrderCtrl',
        controllerAs: 'vm',
        resolve: {
          isMiActual: function($rootScope){
            $rootScope.isMiActual = true;
            return true;
          }
        }
      })
      .when('/ofertas', {
        templateUrl: 'views/offers.html',
        controller: 'OffersCtrl',
        controllerAs: 'vm',
      })
      .when('/politicas-de-entrega', {
        templateUrl: 'views/delivery-policy.html',
        controller: 'DeliveryPolicyCtrl',
        controllerAs: 'deliveryPolicy'
      })
      .when('/politicas-de-instalacion-y-ensamble', {
        templateUrl: 'views/ensamble-policy.html',
        controller: 'EnsamblePolicyCtrl',
        controllerAs: 'ensamblePolicy'
      })
      .when('/politicas-de-almacenaje', {
        templateUrl: 'views/storage-policy.html',
        controller: 'StoragePolicyCtrl',
        controllerAs: 'storagePolicy'
      })
      .when('/politicas-de-garantia', {
        templateUrl: 'views/warranty-policy.html',
        controller: 'WarrantyPolicyCtrl',
        controllerAs: 'warrantyPolicy'
      })
      .when('/user/deliveries', {
        templateUrl: 'views/users/deliveries.html',
        controller: 'UsersUserDeliveriesCtrl',
        controllerAs: 'vm'
      })
      .when('/user/invoices', {
        templateUrl: 'views/users/invoices.html',
        controller: 'UsersUserInvoicesCtrl',
        controllerAs: 'vm'
      })
      .when('/user/payments', {
        templateUrl: 'views/users/payments.html',
        controller: 'UsersUserPaymentsCtrl',
        controllerAs: 'vm'
      })
      .when('/user/ewallet', {
        templateUrl: 'views/users/ewallet.html',
        controller: 'UsersUserEwalletCtrl',
        controllerAs: 'vm'
      })
      .when('/user/purchases', {
        templateUrl: 'views/users/purchases.html',
        controller: 'UsersUserPurchasesCtrl',
        controllerAs: 'vm'
      })
      .when('/checkout/payment-info', {
        templateUrl: 'views/checkout/payment-info.html',
        controller: 'CheckoutPaymentInfoCtrl',
        controllerAs: 'checkout/paymentInfo'
      })
      .when('/envio-y-entrega', {
        templateUrl: 'views/shippinganddelivery.html',
        controller: 'ShippinganddeliveryCtrl',
        controllerAs: 'shippinganddelivery'
      })
      .when('/cambios-devoluciones-y-cancelaciones', {
        templateUrl: 'views/refundstext.html',
        controller: 'RefundstextCtrl',
        controllerAs: 'refundstext'
      })
      .when('/manual-de-cuidados-y-recomendaciones/pieles', {
        templateUrl: 'views/manual/pieles.html',
        controller: 'ManualPielesCtrl',
        controllerAs: 'manual/pieles'
      })
      .when('/manual-de-cuidados-y-recomendaciones/aceros', {
        templateUrl: 'views/manual/aceros.html',
        controller: 'ManualAcerosCtrl',
        controllerAs: 'manual/aceros'
      })
      .when('/manual-de-cuidados-y-recomendaciones/aluminios', {
        templateUrl: 'views/manual/aluminios.html',
        controller: 'ManualAluminiosCtrl',
        controllerAs: 'manual/aluminios'
      })
      .when('/manual-de-cuidados-y-recomendaciones/cristales', {
        templateUrl: 'views/manual/cristales.html',
        controller: 'ManualCristalesCtrl',
        controllerAs: 'manual/cristales'
      })
      .when('/manual-de-cuidados-y-recomendaciones/cromados', {
        templateUrl: 'views/manual/cromados.html',
        controller: 'ManualCromadosCtrl',
        controllerAs: 'manual/cromados'
      })
      .when('/manual-de-cuidados-y-recomendaciones', {
        templateUrl: 'views/manual.html',
        controller: 'ManualCtrl',
        controllerAs: 'manual'
      })
      .when('/manual-de-cuidados-y-recomendaciones/maderas', {
        templateUrl: 'views/manual/maderas.html',
        controller: 'ManualMaderasCtrl',
        controllerAs: 'manual/maderas'
      })
      .when('/manual-de-cuidados-y-recomendaciones/piezas-plasticas', {
        templateUrl: 'views/manual/piezas-plasticas.html',
        controller: 'ManualPiezasPlasticasCtrl',
        controllerAs: 'manual/piezasPlasticas'
      })
      .when('/manual-de-cuidados-y-recomendaciones/textiles', {
        templateUrl: 'views/manual/textiles.html',
        controller: 'ManualTextilesCtrl',
        controllerAs: 'manual/textiles'
      })
      .when('/manual-de-cuidados-y-recomendaciones/viniles', {
        templateUrl: 'views/manual/viniles.html',
        controller: 'ManualVinilesCtrl',
        controllerAs: 'manual/viniles'
      })
      .when('/manual-de-cuidados-y-recomendaciones/vinilos', {
        templateUrl: 'views/manual/vinilos.html',
        controller: 'ManualVinilosCtrl',
        controllerAs: 'manual/vinilos'
      })
      .when('/manual-de-cuidados-y-recomendaciones/pintura-electrostatica', {
        templateUrl: 'views/manual/pintura-electrostatica.html',
        controller: 'ManualPinturaElectrostaticaCtrl',
        controllerAs: 'manual/pinturaElectrostatica'
      })      
      .when('/compra-fiable', {
        templateUrl: 'views/securebuy.html',
        controller: 'SecurebuyCtrl',
        controllerAs: 'securebuy'
      })
      .when('/formas-de-pago', {
        templateUrl: 'views/paymentmethods.html',
        controller: 'PaymentmethodsCtrl',
        controllerAs: 'paymentmethods'
      })
      .when('/preguntas-frecuentes', {
        templateUrl: 'views/faq.html',
        controller: 'FaqCtrl',
        controllerAs: 'faq'
      })
      .when('/faq', {
        templateUrl: 'views/faq.html',
        controller: 'FaqCtrl',
        controllerAs: 'faq'
      })
      .when('/quienes-somos', {
        templateUrl: 'views/aboutus.html',
        controller: 'AboutusCtrl',
        controllerAs: 'aboutus'
      })
      .when('/filosofia', {
        templateUrl: 'views/philosophy.html',
        controller: 'PhilosophyCtrl',
        controllerAs: 'philosophy'
      })
      .when('/nuestras-marcas', {
        templateUrl: 'views/ourbrands.html',
        controller: 'OurbrandsCtrl',
        controllerAs: 'ourbrands'
      })
      .when('/nuestras-tiendas', {
        templateUrl: 'views/ourstores.html',
        controller: 'OurstoresCtrl',
        controllerAs: 'ourstores'
      })
      .when('/aviso-de-privacidad', {
        templateUrl: 'views/privacy.html',
        controller: 'PrivacyCtrl',
        controllerAs: 'privacy'
      })
      .when('/terminos-y-condiciones', {
        templateUrl: 'views/termsandconditions.html',
        controller: 'TermsandconditionsCtrl',
        controllerAs: 'termsandconditions'
      })
      .when('/seguridad', {
        templateUrl: 'views/security.html',
        controller: 'SecurityCtrl',
        controllerAs: 'security'
      })
      .when('/forgot-password', {
        templateUrl: 'views/forgot-password.html',
        controller: 'ForgotPasswordCtrl',
        controllerAs: 'vm'
      })
      .when('/reset-password', {
        templateUrl: 'views/reset-password.html',
        controller: 'ResetPasswordCtrl',
        controllerAs: 'vm'
      })      
      .when('/continuequotation', {
        templateUrl: 'views/continuequotation.html',
        controller: 'ContinuequotationCtrl',
        controllerAs: 'vm',
      })      
      .when('/sitemap', {
        templateUrl: 'views/sitemap.html',
        controller: 'SitemapCtrl',
        controllerAs: 'vm'
      })
      .otherwise({
        redirectTo: '/'
      });

    localStorageServiceProvider.setPrefix(ENV.tokenPrefix + 'actualWeb');

    //JWT TOKENS CONFIG
    $httpProvider.interceptors.push([
      '$q', 
      '$location', 
      'localStorageService',
      'SITE',
      function ($q, $location, localStorageService, SITE) {
        return {
          request: function (config) {
            config.headers = config.headers || {};
            if ( localStorageService.get('token') ) {
              config.headers.Authorization = 'JWT ' + localStorageService.get('token');
            }
            config.headers.site = SITE.name;
            
            return config;
          },
          /*
          responseError: function (response) {
            if (response.status === 401 || response.status === 403) {
              $location.path('/');
            }
            return $q.reject(response);
          }
          */
        };
      }
    ]);

  })



  .run(function(localStorageService, authService, jwtHelper, userService, $location, $rootScope, $route){


      authService.runPolicies();
      //Configures $location.path second parameter, for no reloading

      var original = $location.path;
      $location.path = function (path, reload) {
          if (reload === false) {
              var lastRoute = $route.current;
              var un = $rootScope.$on('$locationChangeSuccess', function () {
                  $route.current = lastRoute;
                  un();
              });
          }
          return original.apply($location, [path]);
      };



  });
